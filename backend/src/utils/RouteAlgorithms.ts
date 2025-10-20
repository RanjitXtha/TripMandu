import TinyQueue from "tinyqueue";
import type { NodeMap_Type, Graph_Type, NodeType, EdgeType } from "./types.js";

export type CostType = "time" | "length";

export function haversineDistance(a: NodeType | null | undefined, b: NodeType): number {
  if (!a || !b) return Infinity;
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aCalc = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

// --- Distance to time in seconds (using m/s speed directly) ---
export function distanceToTime(distanceMeters: number, speedMs: number): number {
  if (!speedMs || speedMs <= 0) return Infinity;
  return distanceMeters / speedMs; // seconds
}

// --- Mode-aware nearest node using m/s speed ---
export function nearestNode(
  point: NodeType,
  nodeMap: NodeMap_Type,
  graph: Graph_Type,
  mode: "car" | "motorbike" | "foot",
  costType: CostType = "length",
  speedMs = 1.39 // default foot speed in m/s
): number | null {
  let nearest: number | null = null;
  let minCost = Infinity;

  for (const idStr in nodeMap) {
    const id = Number(idStr);
    const node = nodeMap[id];

    // Only consider nodes with outgoing edges for the mode
    const edges = graph[id];
    if (!edges || !edges.some(e => e.modes[mode])) continue;

    const dist = haversineDistance(point, node);
    const cost = dist;

    if (cost < minCost) {
      minCost = cost;
      nearest = id;
    }
  }

  return nearest;
}

// --- A* using m/s speed ---
export function aStar(
  startId: number,
  goalId: number,
  graph: Graph_Type,
  nodeMap: NodeMap_Type,
  mode: "car" | "motorbike" | "foot",
  costType: CostType = "length",
  speedMs: number = 1.39
): { path: number[]; totalCost: number; totalDistance: number } | null {
  if (!nodeMap[startId] || !nodeMap[goalId]) return null;

  const queue = new TinyQueue([{ id: startId, f: 0 }], (a, b) => a.f - b.f);
  const gScore: Record<number, number> = { [startId]: 0 };
  const gDistance: Record<number, number> = { [startId]: 0 }; // Track distance
  const cameFrom: Record<number, number> = {};
  const visited = new Set<number>();

  while (queue.length) {
    const current = queue.pop()!;
    const currentId = current.id;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === goalId) {
      const path: number[] = [];
      let curr: number | undefined = currentId;
      while (curr !== undefined) {
        path.push(curr);
        curr = cameFrom[curr];
      }
      return { 
        path: path.reverse(), 
        totalCost: gScore[goalId], 
        totalDistance: gDistance[goalId] 
      };
    }

    const neighbors: EdgeType[] = graph[currentId] || [];
    for (const edge of neighbors) {
      if (!edge.modes[mode]) continue;
      const neighborId = edge.to;
      const edgeCost = costType === "time" ? edge.modes[mode].cost : edge.length_m;
      if (edgeCost === undefined) continue;

      const tentativeG = (gScore[currentId] ?? Infinity) + edgeCost;
      const tentativeDist = (gDistance[currentId] ?? 0) + edge.length_m;

      if (tentativeG < (gScore[neighborId] ?? Infinity)) {
        cameFrom[neighborId] = currentId;
        gScore[neighborId] = tentativeG;
        gDistance[neighborId] = tentativeDist;

        const hDist = haversineDistance(nodeMap[neighborId], nodeMap[goalId]);
        const h = costType === "time" ? distanceToTime(hDist, speedMs) : hDist;
        queue.push({ id: neighborId, f: tentativeG + h });
      }
    }
  }

  return null;
}


// --- Greedy TSP using m/s ---
export function solveGreedyTSP(
  points: NodeType[],
  graph: Graph_Type,
  nodeMap: NodeMap_Type,
  mode: "car" | "motorbike" | "foot",
  costType: CostType = "length",
  speedMs: number = 1.39
): {
  fullPath: number[];
  totalCost: number;
  totalDistance: number;
  tspOrder: number[];
  segments: Array<{
    path: number[];
    cost: number;
    distance: number;
    fromIndex: number;
    toIndex: number;
  }>;
} | null {
  if (points.length === 0) return null;

  const nodeIds: number[] = [];
  for (const p of points) {
    const nearest = nearestNode(p, nodeMap, graph, mode, costType, speedMs);
    if (nearest == null) return null;
    nodeIds.push(nearest);
  }

  const unvisited = new Set(nodeIds.slice(1));
  const tspOrder: number[] = [0];
  const fullPath: number[] = [nodeIds[0]];
  const segments: Array<{
    path: number[];
    cost: number;
    distance: number;
    fromIndex: number;
    toIndex: number;
  }> = [];
  
  let totalCost = 0;
  let totalDistance = 0;
  let currentId = nodeIds[0];
  let currentDestIndex = 0;

  while (unvisited.size > 0) {
    let bestNeighbor: number | null = null;
    let bestResult: { path: number[]; totalCost: number; totalDistance: number } | null = null;

    for (const candidate of unvisited) {
      const result = aStar(currentId, candidate, graph, nodeMap, mode, costType, speedMs);
      if (!result) continue;
      if (!bestResult || result.totalCost < bestResult.totalCost) {
        bestResult = result;
        bestNeighbor = candidate;
      }
    }

    if (!bestResult || bestNeighbor === null) return null;

    const destIndex = nodeIds.indexOf(bestNeighbor);
    
    // Store segment information
    segments.push({
      path: bestResult.path,
      cost: bestResult.totalCost,
      distance: bestResult.totalDistance,
      fromIndex: currentDestIndex,
      toIndex: destIndex
    });

    fullPath.push(...bestResult.path.slice(1));
    totalCost += bestResult.totalCost;
    totalDistance += bestResult.totalDistance;

    tspOrder.push(destIndex);

    currentId = bestNeighbor;
    currentDestIndex = destIndex;
    unvisited.delete(bestNeighbor);
  }

  // 🔁 Add final leg to return to start for round trip
  const returnPath = aStar(currentId, nodeIds[0], graph, nodeMap, mode, costType, speedMs);
  if (!returnPath) return null;

  segments.push({
    path: returnPath.path,
    cost: returnPath.totalCost,
    distance: returnPath.totalDistance,
    fromIndex: currentDestIndex,
    toIndex: 0
  });

  fullPath.push(...returnPath.path.slice(1));
  totalCost += returnPath.totalCost;
  totalDistance += returnPath.totalDistance;

  tspOrder.push(0); // Return to starting point

  return { fullPath, totalCost, totalDistance, tspOrder, segments };
}


