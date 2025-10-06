import dotenv from "dotenv";
dotenv.config();

import prisma from "./db/index.js";
import { app } from "./app.js";
import { initGraphData } from "./utils/GraphLoader.js";

import type { NodeMap_Type, Graph_Type } from "./utils/types.js";

const PORT = process.env.PORT || 8080;

interface CachedGraph {
  nodeMap: NodeMap_Type;
  graph: Graph_Type;
  turnRestrictions: Set<string>;
}

// Global cache (only one graph, supports all modes)
let graphCache: CachedGraph | null = null;

async function preloadGraph() {
  console.log("Preloading unified graph...");

  const { nodeMap, graph, turnRestrictions } = await initGraphData(); // no mode param
  graphCache = { nodeMap, graph, turnRestrictions };

  console.log("Unified graph preloaded.");
}

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    await preloadGraph();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing DB connection...");
  await prisma.$disconnect();
  process.exit(0);
});

main();

export { graphCache };
