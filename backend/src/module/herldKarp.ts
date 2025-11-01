import { solveHeldKarpTSP } from "../utils/RouteAlgorithms.js";
import { graphCache } from "../index.js";


async function testTSP() {
  // Wait until graphCache is ready
  while (!graphCache) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const { graph, nodeMap } = graphCache;

  const points = [
    { lat: 27.700769, lon: 85.30014 },
    { lat: 27.6841, lon: 85.3240 },
    { lat: 27.7172, lon: 85.3620 },
  ];

  const result = solveHeldKarpTSP(points, graph, nodeMap, "car", "length", 1.39);
  console.log("Result:", result);
}

testTSP();
