import prisma from "../db/index.js";
import type { NodeMapType, GraphType } from "./types.js";


function parseCoords(coord: string): [number, number] {
  const [lon, lat] = coord.replace("POINT(", "").replace(")", "").split(" ");
  return [parseFloat(lon), parseFloat(lat)];
}

export async function loadGraph() {
  const rawNodes = await prisma.$queryRawUnsafe<
    { id: number; coord: string }[]
  >(`
    SELECT id, ST_AsText(location) as coord FROM "Node";
  `);

  const nodeMap: NodeMapType = {};
  for (const node of rawNodes) {
    const [lon, lat] = parseCoords(node.coord);
    nodeMap[node.id.toString()] = { lat, lon };
  }

  // Fetch all edges with fromId, toId, cost
  const rawEdges = await prisma.$queryRawUnsafe<
    { fromId: number; toId: number; cost: number }[]
  >(`
    SELECT "fromId", "toId", cost FROM "Edge";
  `);

  const graph: GraphType = {};
  for (const edge of rawEdges) {
    const from = edge.fromId.toString();

    if (!graph[from]) graph[from] = [];
    graph[from].push({ node: edge.toId, dist: edge.cost });
  }

  return { nodeMap, graph };
}
