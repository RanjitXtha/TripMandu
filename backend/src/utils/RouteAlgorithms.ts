import TinyQueue from "tinyqueue";
import type { NodeMap_Type, Graph_Type, NodeType } from "./types.js";
import { appendFileSync } from "fs";

function logToFile(message: string) {
  try {
    appendFileSync("astar.log", message + "\n");
  } catch (err) {
    console.error("Failed to write log:", err);
  }
}

// Haversine distance in meters
function distanceToTime(distanceMeters: number, speedKmh: number): number {
  const speedMs = speedKmh * 1000 / 3600;
  return distanceMeters / speedMs;
}

// Haversine distance between two geo points (in meters)
export function haversineDistance(a: NodeType | null | undefined, b: NodeType): number {
  if (!a || !b || typeof a.lat !== "number" || typeof a.lon !== "number" || typeof b.lat !== "number" || typeof b.lon !== "number") {
    return Infinity;
  }
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aCalc = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

export function aStar(
  startId: number,
  goalId: number,
  graph: Graph_Type,
  nodeMap: NodeMap_Type,
  defaultSpeedKmh: number = 50
): number[] | null {
  logToFile(`Starting A* from ${startId} to ${goalId}`);
  logToFile(`Graph nodes: ${Object.keys(nodeMap).length}, edges: ${Object.keys(graph).length}`);
  logToFile(`Start node: ${JSON.stringify(nodeMap[startId])}`);
  logToFile(`Goal node: ${JSON.stringify(nodeMap[goalId])}`);

  if (!nodeMap[startId] || !nodeMap[goalId]) {
    logToFile("ERROR: Start or goal node is missing in nodeMap.");
    return null;
  }

  const queue = new TinyQueue([{ id: startId, f: 0 }], (a, b) => a.f - b.f);
  const gScore: Record<number, number> = { [startId]: 0 };
  const cameFrom: Record<number, number> = {};
  const visited = new Set<number>();

  while (queue.length) {
    const current = queue.pop()!;
    const currentId = Number(current.id);

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    logToFile(`Visiting node ${currentId} with f = ${current.f.toFixed(2)}`);

    if (currentId === goalId) {
      const path = [currentId];
      let curr = currentId;
      while (cameFrom.hasOwnProperty(curr)) {
        curr = cameFrom[curr];
        path.push(curr);
      }
      const result = path.reverse();
      logToFile(`Final path found: ${result.join(" -> ")}`);
      return result;
    }

    const neighbors = graph[currentId] || [];
    logToFile(`Neighbors of node ${currentId}: ${neighbors.map(n => n.to).join(", ")}`);

    for (const edge of neighbors) {
      const neighborId = Number(edge.to);

      if (!nodeMap[neighborId] || !nodeMap[goalId]) {
        logToFile(`WARNING: Invalid node map for neighbor ${neighborId} or goal ${goalId}`);
        continue;
      }

      const tentativeG = gScore[currentId] + edge.cost;
      if (tentativeG < (gScore[neighborId] ?? Infinity)) {
        cameFrom[neighborId] = currentId;
        gScore[neighborId] = tentativeG;

        const hDist = haversineDistance(nodeMap[neighborId], nodeMap[goalId]);
        const h = distanceToTime(hDist, defaultSpeedKmh);
        const f = tentativeG + h;

        logToFile(` → Neighbor ${neighborId}: g=${tentativeG.toFixed(2)}, h=${h.toFixed(2)}, f=${f.toFixed(2)}`);

        queue.push({ id: neighborId, f });
      }
    }
  }

  logToFile(`No path found from ${startId} to ${goalId}`);
  return null;
}


// Nearest node search (by haversine distance)
export function nearestNode(point: NodeType, nodeMap: NodeMap_Type): number | null {
  let nearest: number | null = null;
  let minDist = Infinity;

  for (const idStr in nodeMap) {
    const id = Number(idStr);
    const node = nodeMap[id];
    const dist = haversineDistance(point, node);
    if (dist < minDist) {
      minDist = dist;
      nearest = id;
    }
  }

  return Number(nearest);
}

// Greedy TSP solver (by haversine distance)
export function solveGreedyTSP(locations: NodeType[]): number[] {
  const n = locations.length;
  const visited = new Array(n).fill(false);
  const order = [0];
  visited[0] = true;

  let current = 0;
  for (let step = 1; step < n; step++) {
    let next = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const dist = haversineDistance(locations[current], locations[i]);
        if (dist < minDist) {
          minDist = dist;
          next = i;
        }
      }
    }

    if (next !== -1) {
      visited[next] = true;
      order.push(next);
      current = next;
    }
  }

  // order.push(0); 
  // Return to start
  logToFile("TSP Order: " + order.join(" -> "));
  return order;
}



// Nearest node search (by haversine distance)

