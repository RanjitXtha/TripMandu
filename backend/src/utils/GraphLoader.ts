import prisma from "../db/index.js";
import type { NodeMap_Type, Graph_Type } from "./types.ts";

// Global memory cache
export const nodeMap: NodeMap_Type = {};
export const graph: Graph_Type = {};

export async function initGraphData(mode: "car" | "foot" | "bicycle") {
  const graph: Graph_Type = {};
  const nodeMap: NodeMap_Type = {};

  console.log(`Loading routing_nodes for ${mode}...`);

  const edgesTable = `routing_edges_${mode}`;

  const nodes = await prisma.$queryRawUnsafe<{
    id: number;
    lat: number;
    lon: number;
  }[]>(`
    SELECT id, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lon
    FROM routing_nodes
    WHERE id IN (
      SELECT source FROM ${edgesTable}
      UNION
      SELECT target FROM ${edgesTable}
    )
  `);

  for (const n of nodes) {
    nodeMap[n.id] = { lat: n.lat, lon: n.lon };
  }

  console.log(`Loaded ${nodes.length} nodes for ${mode}.`);

  console.log(`Loading ${edgesTable}...`);

  const edges = await prisma.$queryRawUnsafe<{
  id: number;
  source: number;
  target: number;
  cost: number;          // for "car" and "bicycle"
  reverse_cost: number;  // for "car" and "bicycle"
  length_m?: number;     // only for "foot"
}[]>(`
  SELECT id, source, target, cost, reverse_cost ${mode === "foot" ? ", length_m" : ""}
  FROM ${edgesTable}
`);

for (const edge of edges) {
  const forwardCost = mode === "foot" ? edge.length_m  : edge.cost;
  const backwardCost = mode === "foot" ? edge.length_m  : edge.reverse_cost;

  if (!graph[edge.source]) graph[edge.source] = [];
  graph[edge.source].push({
    to: edge.target,
    cost: Number(forwardCost),
    edgeId: edge.id,
    mode,
  });

  if (mode === "foot" || edge.reverse_cost >= 0) {
    if (!graph[edge.target]) graph[edge.target] = [];
    graph[edge.target].push({
      to: edge.source,
      cost: Number(backwardCost),
      edgeId: edge.id,
      mode,
    });
  }
}

  console.log(`Loaded ${edges.length} ${mode} edges.`);

  return {
    nodeMap,
    graph,
  };
}
