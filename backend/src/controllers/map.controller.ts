import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { graphCache } from "../index.js";
import { aStar, nearestNode, solveHeldKarpTSP, CostType } from "../utils/RouteAlgorithms.js";
import destinationRaw from "../data/destinations.json" with { type: "json" };
import { textToVector, cosineSimilarity } from "../utils/RouteAlgorithms.js";
import { haversineDistance } from "../utils/RouteAlgorithms.js";


interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export type Mode = "car" | "foot" | "motorbike";

function getMode(mode: any): Mode {
  if (mode === "car" || mode === "foot" || mode === "motorbike") return mode;
  throw new ApiError(400, `Invalid mode: ${mode}`);
}

// --- GET ROUTE ---
export const getRoute = asyncHandler(async (req: Request, res: Response) => {
  const {
    start,
    end,
    mode = "car",
    costType = "length",
  }: { start: Location; end: Location; mode?: Mode; costType?: CostType } = req.body;

  if (!graphCache) throw new ApiError(500, "Graph not loaded");

  const transportMode = getMode(mode);
  const { graph, nodeMap } = graphCache;

  // Use mode-aware nearest node
  const startId = nearestNode(start, nodeMap, graph, transportMode, costType);
  const goalId = nearestNode(end, nodeMap, graph, transportMode, costType);

  if (startId == null || goalId == null)
    throw new ApiError(400, `Nearest node not found for mode '${transportMode}'`);

  const result = aStar(startId, goalId, graph, nodeMap, transportMode, costType, 5);
  if (!result)
    throw new ApiError(
      400,
      `No path found between the selected points for mode '${transportMode}'`
    );

  const pathCoords = result.path.map((id) => {
    const node = nodeMap[id];
    return [node.lat, node.lon];
  });

  res.json({
    path: pathCoords,
    totalCost: result.totalCost,
    costType,
    mode: transportMode,
  });
});

export const SPEEDS: Record<Mode, number> = { foot: 1.39, motorbike: 7.8, car: 6 };

// --- GREEDY TSP ---
export const solveTSPHandler = asyncHandler(async (req: Request, res: Response) => {
  const {
    destinations,
    mode = "car",
    costType = "length",
  }: { destinations: Location[]; mode?: Mode; costType?: CostType } = req.body;

  if (!graphCache) throw new ApiError(500, "Graph not loaded");
  if (!Array.isArray(destinations) || destinations.length < 2)
    throw new ApiError(400, "At least two destinations are required");

  const transportMode = getMode(mode);
  const { graph, nodeMap } = graphCache;

  // Mode-aware nearest nodes for each destination
  const tspResult = solveHeldKarpTSP(destinations, graph, nodeMap, transportMode, costType, SPEEDS[transportMode]);

  if (!tspResult)
    throw new ApiError(
      400,
      `TSP path could not be computed for mode '${transportMode}'`
    );

  const fullPathCoords = tspResult.fullPath.map((id) => {
    const node = nodeMap[id];
    return [node.lat, node.lon];
  });

  // Convert segments to coordinate format
  const segmentsCoords = tspResult.segments.map(segment => ({
    path: segment.path.map(id => {
      const node = nodeMap[id];
      return [node.lat, node.lon];
    }),
    cost: segment.cost,
    distance: segment.distance,
    fromIndex: segment.fromIndex,
    toIndex: segment.toIndex
  }));

  let factor = 1.5;

  if (transportMode === "foot") {
    factor = 1.2;
  } else if (transportMode === "car") {
    factor = 1.4;
  } else {
    factor = 1.3;
  }


  console.log(`Time: ${(tspResult.totalCost * factor) / 60}min, Distance: ${tspResult.totalDistance / 1000}km`);

  res.status(200).json({
    tspOrder: tspResult.tspOrder,
    path: fullPathCoords,
    segments: segmentsCoords.map(seg => ({
      path: seg.path,
      cost: (seg.cost * factor) / 60,
      distance: seg.distance / 1000,
      fromIndex: seg.fromIndex,
      toIndex: seg.toIndex
    })),
    totalCost: (tspResult.totalCost * factor) / 60,
    totalDistance: tspResult.totalDistance / 1000,
    mode: transportMode,
    costType,
  });
});

interface Destination {
  name: string;
  description: string;
  categories: string[];
  coordinates: { lat: number; lon: number };
  [key: string]: any;
}

const destinations = (destinationRaw as any[]).map((d) => ({
  ...d,
  categories: d.categories || (d.category ? [d.category] : []),
}));

// Adjustable max distance in KM for nearby
const MAX_DISTANCE_KM = 5;

export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { name, type }: { name: string; type: "nearby" | "similar" } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Missing required fields: 'name' and 'type'" });
  }

  const target = destinations.find((d) => d.name === name);
  if (!target) {
    return res.status(404).json({ error: "Destination not found" });
  }

  // Compute scores or distances for all others
  const results = destinations
    .filter((d) => d.name !== name)
    .map((d) => {
      const dist = haversineDistance(
        { lat: target.coordinates.lat, lon: target.coordinates.lon },
        { lat: d.coordinates.lat, lon: d.coordinates.lon }
      ) / 1000;

      let similarity = 0;
      if (type === "similar") {
        const vecA = textToVector(target.name + " " + target.description + " " + target.categories.join(" "));
        const vecB = textToVector(d.name + " " + d.description + " " + d.categories.join(" "));
        similarity = cosineSimilarity(vecA, vecB);
      }

      return {
        ...d,
        similarityScore: similarity,
        distanceKm: parseFloat(dist.toFixed(2)),
      };
    });

  let filtered;

  if (type === "nearby") {
    filtered = results
      .filter((r) => r.distanceKm <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    filtered = results
      .filter((r) => r.similarityScore >= 0.2)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  // Optional: fallback from nearby → similar if no results found
  if (type === "nearby" && filtered.length === 0) {
    console.warn(`No nearby found for '${name}', falling back to similarity`);
    filtered = results
      .filter((r) => r.similarityScore >= 0.2)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  // Optional: Debug distances
  // console.log(`Distances from ${name}:`, results.map(r => ({ name: r.name, km: r.distanceKm })));

  const recommendations = filtered.slice(0, 5);
  res.json({ recommendations });
});

