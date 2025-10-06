import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { graphCache } from "../index.js";
import { aStar, nearestNode, solveGreedyTSP, CostType } from "../utils/RouteAlgorithms.js";

interface Location {
  lat: number;
  lon: number;
  name?: string;
}

type Mode = "car" | "foot" | "motorbike";

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

const SPEEDS: Record<Mode, number> = { foot: 1.39, motorbike: 7.8, car: 7.2 };

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
  const tspResult = solveGreedyTSP(destinations, graph, nodeMap, transportMode, costType, SPEEDS[transportMode]);

  if (!tspResult)
    throw new ApiError(
      400,
      `TSP path could not be computed for mode '${transportMode}'`
    );

  const fullPathCoords = tspResult.fullPath.map((id) => {
    const node = nodeMap[id];
    return [node.lat, node.lon];
  });

  console.log(`Time: ${tspResult.totalCost/60}min, Distance: ${tspResult.totalDistance/1000}km`);


  res.status(200).json({
    tspOrder: tspResult.tspOrder,
    path: fullPathCoords,
    totalCost: tspResult.totalCost,
    mode: transportMode,
    costType,
  });
});
