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

export { aStar, nearestNode, haversineDistance };


