import prisma from "../db/index.js";
import type { NodeMap_Type, Graph_Type, EdgeType, ModeCost, TurnRestrictionSet, LoadGraphResult } from "./types.js";

export const nodeMap: NodeMap_Type = {};
export const graph: Graph_Type = {};
export const turnRestrictions: TurnRestrictionSet = new Set();

export async function initGraphData(): Promise<LoadGraphResult> {
  // --- 1. Load nodes ---
  if (!Object.keys(nodeMap).length) {
    const nodes = await prisma.$queryRawUnsafe<{ id: number; lat: number; lon: number }[]>(`
      SELECT id, lat, lon FROM routing_nodes
    `);
    for (const n of nodes) nodeMap[n.id] = { lat: n.lat, lon: n.lon };
    console.log(`Loaded ${nodes.length} nodes.`);
  }

  const modes: Array<'car' | 'motorbike' | 'foot'> = ['car', 'motorbike', 'foot'];

  // --- 2. Load edges per mode ---
  for (const mode of modes) {
    const table = `routing_edges_${mode}`;
    const edges = await prisma.$queryRawUnsafe<{
      id: number;
      source: number;
      target: number;
      cost: number;
      reverse_cost: number;
      length_m: number;
    }[]>(`SELECT id, source, target, cost, reverse_cost, length_m FROM ${table}`);

    for (const e of edges) {
      // --- forward edge ---
      let forward = graph[e.source]?.find(edge => edge.to === e.target);
      if (!forward) {
        forward = { to: e.target, length_m: e.length_m, modes: {} };
        if (!graph[e.source]) graph[e.source] = [];
        graph[e.source].push(forward);
      }
      forward.modes[mode] = { cost: e.cost, reverseCost: e.reverse_cost };

      // --- backward edge (if traversable) ---
      if (e.reverse_cost !== Infinity && e.reverse_cost != null) {
        let backward = graph[e.target]?.find(edge => edge.to === e.source);
        if (!backward) {
          backward = { to: e.source, length_m: e.length_m, modes: {} };
          if (!graph[e.target]) graph[e.target] = [];
          graph[e.target].push(backward);
        }
        backward.modes[mode] = { cost: e.reverse_cost, reverseCost: e.cost };
      }
    }

    console.log(`Loaded ${edges.length} edges for mode ${mode}.`);
  }

  // --- 3. Load turn restrictions ---
  const restrictions = await prisma.$queryRawUnsafe<{ from_edge: number; via_node: number; to_edge: number }[]>(`
    SELECT from_edge, via_node, to_edge FROM turn_restrictions
  `);

  for (const r of restrictions) {
    turnRestrictions.add(`${r.from_edge}-${r.via_node}-${r.to_edge}`);
  }
  console.log(`Loaded ${turnRestrictions.size} turn restrictions.`);

  return { nodeMap, graph, turnRestrictions };
}
