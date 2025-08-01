import dotenv from "dotenv";
dotenv.config();

import prisma from "./db/index.js";
import { app } from "./app.js";
import { initGraphData } from "./utils/GraphLoader.js";

import type { NodeMap_Type, Graph_Type } from "./utils/types.ts";

const PORT = process.env.PORT || 8080;

interface CachedGraph {
  nodeMap: NodeMap_Type;
  graph: Graph_Type;
  turnRestrictions: Set<string>;
}

// Global cache for all modes (foot/bicycle/car)
const graphCache: Record<"foot" | "bicycle" | "car", CachedGraph> = {
  foot: null!,
  bicycle: null!,
  car: null!,
};

async function preloadGraphs() {
  console.log("Preloading graphs...");

  for (const mode of ["car", "foot", "bicycle"] as const) {
    const { nodeMap, graph } = await initGraphData(mode);
    graphCache[mode] = {
      nodeMap,
      graph,
      turnRestrictions: new Set(), // can load turn restrictions separately if needed
    };
  }

  console.log("All graphs preloaded.");
}

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    await preloadGraphs();

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
