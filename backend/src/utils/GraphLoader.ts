import prisma from "../db/index.js";
import type { NodeMapType, GraphType } from "./types.js";

function parseCoords(coord: string): [number, number] {
  const [lon, lat] = coord.replace("POINT(", "").replace(")", "").split(" ");
  return [parseFloat(lon), parseFloat(lat)];
}

export async function loadGraph() {
  const rawNodes = await prisma.$queryRawUnsafe<
    { node_id: bigint; lat: number; lon: number }[]
  >(`
    SELECT node_id, lat, lon FROM graph_nodes;
  `);

  const nodeMap: NodeMapType = {};
  for (const node of rawNodes) {
    nodeMap[node.node_id.toString()] = { lat: node.lat, lon: node.lon };
  }

  const rawEdges = await prisma.$queryRawUnsafe<
    { source: bigint; target: bigint; distance: number | null }[]
  >(`
    SELECT source, target, distance FROM graph_edges;
  `);

  const graph: GraphType = {};
  for (const edge of rawEdges) {
    const from = edge.source.toString();

    if (!graph[from]) graph[from] = [];
    graph[from].push({ node: Number(edge.target), dist: edge.distance ?? 0 });
  }

  return { nodeMap, graph };
}
