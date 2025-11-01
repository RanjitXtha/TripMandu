import { graphCache } from "../index.js";
import { aStar } from "../utils/RouteAlgorithms.js";

async function testAStar() {
  // Wait until graphCache is ready
  while (!graphCache) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const { graph, nodeMap } = graphCache;

  const startId = 11;
  const goalId = 3;
  const mode: "car" | "foot" = "car";

  const result = aStar(startId, goalId, graph, nodeMap, mode, "length", 1.39);
  console.log("Result:", result);
}

testAStar();
