import TinyQueue from "tinyqueue";
import type { NodeMapType,GraphType,Graph ,NodeType } from "./types.js";

function haversineDistance(a:NodeType, b:NodeType) {
  const R = 6371e3; // meters
  const toRad = (deg:any) => deg * Math.PI / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aVal = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c;
}



function aStar(
  startId: number,
  goalId: number,
  graph: GraphType,
  nodeMap: NodeMapType
): number[] | null {
  const queue = new TinyQueue<{ id: number; f: number }>(
    [{ id: startId, f: haversineDistance(nodeMap[startId], nodeMap[goalId]) }],
    (a, b) => a.f - b.f
  );

  const cameFrom: Record<number, number> = {};
  const gScore: Record<number, number> = { [startId]: 0 };
  const visited = new Set<number>();

  while (queue.length > 0) {
    const current = queue.pop()!;
    let currentId = Number(current.id);

    if (currentId === goalId) {
      const path = [currentId];
      while (cameFrom[currentId]) {
        currentId = cameFrom[currentId];
        path.push(currentId);
      }
      return path.reverse();
    }

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const neighbors:Graph[] = graph[currentId] || [];

    for (const neighbor of neighbors) {
      const neighborId = Number(neighbor.node);
      const tentativeG = gScore[currentId] + neighbor.dist;

      if (tentativeG < (gScore[neighborId] ?? Infinity)) {
        cameFrom[neighborId] = currentId;
        gScore[neighborId] = tentativeG;
        const f = tentativeG + haversineDistance(nodeMap[neighborId], nodeMap[goalId]);
        queue.push({ id: neighborId, f });
      }
    }
  }

  return null;
}

function nearestNode(point:NodeType, nodeMap:NodeMapType) {
  let minDist = Infinity;
  let nearestId = null;

  for (const id in nodeMap) {
    const dist = haversineDistance(point, nodeMap[id]);
    if (dist < minDist) {
      minDist = dist;
      nearestId = Number(id);
    }
  }
 return nearestId;
}


const solveTSP = (locations: NodeType[]): number[] => {
  const n = locations.length;
  if (n === 0) return [];

  const visited = new Array(n).fill(false);
  const order: number[] = [0];
  visited[0] = true;

  let current = 0;

  for (let step = 1; step < n; step++) {
    let nearest = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const dist = haversineDistance(locations[current], locations[i]);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
    }

    if (nearest !== -1) {
      visited[nearest] = true;
      order.push(nearest);
      current = nearest;
    }
  }

  order.push(0);

  return order;
};

export { aStar, nearestNode, haversineDistance,solveTSP };