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
export function solveHeldKarpTSP(
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

  // Find nearest nodes for all points
  const nodeIds: number[] = [];
  for (const p of points) {
    const nearest = nearestNode(p, nodeMap, graph, mode, costType, speedMs);
    if (nearest == null) return null;
    nodeIds.push(nearest);
  }

  const n = nodeIds.length;
  
  // For single point, just return it
  if (n === 1) {
    return {
      fullPath: [nodeIds[0]],
      totalCost: 0,
      totalDistance: 0,
      tspOrder: [0, 0],
      segments: []
    };
  }

  // Precompute all pairwise paths and costs
  const pathCache: { [key: string]: { path: number[]; totalCost: number; totalDistance: number } } = {};
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const result = aStar(nodeIds[i], nodeIds[j], graph, nodeMap, mode, costType, speedMs);
      if (!result) return null;
      pathCache[`${i}-${j}`] = result;
    }
  }

  // Held-Karp algorithm using bitmask DP
  // dp[mask][i] = minimum cost to visit all nodes in mask ending at node i
  const dp: { [key: string]: number } = {};
  const parent: { [key: string]: number } = {};

  // Initialize: start from node 0
  dp['1-0'] = 0; // mask=1 (only node 0 visited), ending at node 0

  // Iterate through all subsets
  for (let mask = 1; mask < (1 << n); mask++) {
    // Check if starting node (0) is in the mask
    if ((mask & 1) === 0) continue;

    for (let last = 0; last < n; last++) {
      // Check if 'last' is in the current mask
      if ((mask & (1 << last)) === 0) continue;

      const key = `${mask}-${last}`;
      if (!(key in dp)) continue;

      // Try adding each unvisited node
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue; // Already visited

        const newMask = mask | (1 << next);
        const newKey = `${newMask}-${next}`;
        const newCost = dp[key] + pathCache[`${last}-${next}`].totalCost;

        if (!(newKey in dp) || newCost < dp[newKey]) {
          dp[newKey] = newCost;
          parent[newKey] = last;
        }
      }
    }
  }

  // Find the best tour (all nodes visited, ending at any node)
  const allVisited = (1 << n) - 1;
  let bestCost = Infinity;
  let bestLast = -1;

  for (let last = 1; last < n; last++) {
    const key = `${allVisited}-${last}`;
    if (!(key in dp)) continue;

    // Add cost to return to start
    const tourCost = dp[key] + pathCache[`${last}-0`].totalCost;
    if (tourCost < bestCost) {
      bestCost = tourCost;
      bestLast = last;
    }
  }

  if (bestLast === -1) return null;

  // Reconstruct the tour
  const tour: number[] = [];
  let mask = allVisited;
  let current = bestLast;

  while (mask > 1) {
    tour.push(current);
    const key = `${mask}-${current}`;
    const prev = parent[key];
    mask ^= (1 << current);
    current = prev;
  }
  tour.push(0);
  tour.reverse();

  // Build the full path and segments
  const tspOrder: number[] = [...tour, 0]; // Add return to start
  const fullPath: number[] = [nodeIds[tour[0]]];
  const segments: Array<{
    path: number[];
    cost: number;
    distance: number;
    fromIndex: number;
    toIndex: number;
  }> = [];

  let totalCost = 0;
  let totalDistance = 0;

  // Add segments for the tour
  for (let i = 0; i < tour.length - 1; i++) {
    const from = tour[i];
    const to = tour[i + 1];
    const segment = pathCache[`${from}-${to}`];

    segments.push({
      path: segment.path,
      cost: segment.totalCost,
      distance: segment.totalDistance,
      fromIndex: from,
      toIndex: to
    });

    fullPath.push(...segment.path.slice(1));
    totalCost += segment.totalCost;
    totalDistance += segment.totalDistance;
  }

  // Add return segment to start
  const lastNode = tour[tour.length - 1];
  const returnSegment = pathCache[`${lastNode}-0`];

  segments.push({
    path: returnSegment.path,
    cost: returnSegment.totalCost,
    distance: returnSegment.totalDistance,
    fromIndex: lastNode,
    toIndex: 0
  });

  fullPath.push(...returnSegment.path.slice(1));
  totalCost += returnSegment.totalCost;
  totalDistance += returnSegment.totalDistance;

  return { fullPath, totalCost, totalDistance, tspOrder, segments };
}

export type Vector = { [word: string]: number };

export function textToVector(text: string): Record<string, number> {
  const words = text.toLowerCase().match(/\w+/g) || [];
  const freq: Record<string, number> = {};
  words.forEach((word) => {
    freq[word] = (freq[word] || 0) + 1;
  });
  return freq;
}

export function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  const dotProduct = Array.from(allWords).reduce((sum, word) => sum + (vecA[word] || 0) * (vecB[word] || 0), 0);
  const magA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}


