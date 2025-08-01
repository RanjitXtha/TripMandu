import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { graphCache } from "../index.js";
import { aStar, nearestNode, solveGreedyTSP } from "../utils/RouteAlgorithms.js";

interface Location {
  lat: number;
  lon: number;
  name?: string;
}

type Mode = "car" | "foot" | "bicycle";

function getMode(mode: any): Mode {
  if (mode === "car" || mode === "foot" || mode === "bicycle") return mode;
  throw new ApiError(400, `Invalid mode: ${mode}`);
}

export const getRoute = asyncHandler(async (req: Request, res: Response) => {
  const { start, end, mode = "car" } = req.body;
  if (!start || !end) throw new ApiError(400, "Coordinates required");

  const transportMode = getMode(mode);
  const cached = graphCache[transportMode];
  if (!cached) throw new ApiError(500, `Graph not loaded for mode ${transportMode}`);

  const { graph, nodeMap } = cached;

  const startId = nearestNode(start, nodeMap);
  const goalId = nearestNode(end, nodeMap);

  if (startId == null || goalId == null) throw new ApiError(400, "Nearest node not found");

  const pathIds = aStar(startId, goalId, graph, nodeMap);
  if (!pathIds) throw new ApiError(400, "Path not found");

  const pathCoords = pathIds.map((id) => {
    const node = nodeMap[id];
    return [node.lat, node.lon];
  });

  res.json({ path: pathCoords });
});

export const solveTSPHandler = asyncHandler(async (req: Request, res: Response) => {
  const { destinations, mode = "car" }: { destinations: Location[]; mode?: Mode } = req.body;

  if (!Array.isArray(destinations) || destinations.length < 2) {
    throw new ApiError(400, "At least two destinations are required");
  }

  const transportMode = getMode(mode);
  const cached = graphCache[transportMode];
  if (!cached) throw new ApiError(500, `Graph not loaded for mode ${transportMode}`);

  const { graph, nodeMap } = cached;
  const tspOrder = solveGreedyTSP(destinations);

  let fullPath: [number, number][] = [];

  for (let i = 0; i < tspOrder.length - 1; i++) {
    const from = destinations[tspOrder[i]];
    const to = destinations[tspOrder[i + 1]];
    const fromId = nearestNode(from, nodeMap);
    const toId = nearestNode(to, nodeMap);

    if (fromId == null || toId == null) throw new ApiError(400, "Nearest node not found");

    const segment = aStar(fromId, toId, graph, nodeMap);
    if (!segment) throw new ApiError(400, `Path not found from ${fromId} to ${toId}`);

    const coords = segment.map((id) => [nodeMap[id].lat, nodeMap[id].lon] as [number, number]);
    if (i > 0 && coords.length) coords.shift(); // Avoid duplicate node
    fullPath.push(...coords);
  }

  res.status(200).json({ path: fullPath, tspOrder });
});
