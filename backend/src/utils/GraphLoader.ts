import prisma from "../db/index.js";
import type { NodeMapType,GraphType } from "./types.js";

export async function loadGraph(): Promise<{ nodeMap: NodeMapType; graph: GraphType }> {
  const nodes = await prisma.graph_nodes.findMany();
  const nodeMap: NodeMapType = {};

  for (const node of nodes) {
    const key = node.node_id.toString(); // convert bigint to string
    nodeMap[key] = { lat: node.lat!, lon: node.lon! };
  }

  const edges = await prisma.graph_edges.findMany();
  const graph: GraphType = {};

  for (const edge of edges) {
    const source = edge.source.toString(); // convert bigint to string
    const target = Number(edge.target);    // keep as number for 'node'

    if (!graph[source]) graph[source] = [];
    graph[source].push({ node: target, dist: edge.distance! });
  }

  return { nodeMap, graph };
}

