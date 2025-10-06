// scripts/precompute.ts
import fs from "fs";
import path from "path";
import { initGraphData, nodeMap, graph } from "./utils/GraphLoader.js";
import { aStar, nearestNode } from "./utils/RouteAlgorithms.js";

type StopData = { id: string; name: string; lat: number; lng: number };
type Stop = { id: string; name: string; lat: number; lon: number };
type RawRoute = { id: string; name: string; lineColor: string; stops: string[] };
type Segment = { from: string; to: string; coords: [number, number][] };
type PrecomputedRoute = {
  id: string;
  name: string;
  color: string;
  stops: Stop[];
  geometry: [number, number][];
  segments: Segment[];
};

async function precompute() {
  await initGraphData();

  // 1️⃣ Load stops data
  const stopsPath = path.join("src", "data", "stops_data.json");
  const stopsRaw: StopData[] = JSON.parse(fs.readFileSync(stopsPath, "utf8"));
  const stopsMap = new Map(stopsRaw.map((s) => [s.id, s]));

  // 2️⃣ Load route data (with only stop IDs)
  const routesPath = path.join("src", "data", "route_data.json");
  const rawRoutes: RawRoute[] = JSON.parse(fs.readFileSync(routesPath, "utf8"));

  const results: PrecomputedRoute[] = [];

  for (const route of rawRoutes) {
    console.log(`🚍 Processing route: ${route.name}`);

    const routeStops: Stop[] = [];
    for (const stopId of route.stops) {
      const stopData = stopsMap.get(stopId);
      if (!stopData) {
        console.warn(`⚠️ Stop ID ${stopId} not found in stops_data.json`);
        continue;
      }
      routeStops.push({
        id: stopData.id,
        name: stopData.name,
        lat: stopData.lat,
        lon: stopData.lng, // convert lng → lon
      });
    }

    const segments: Segment[] = [];
    const fullCoords: [number, number][] = [];

    for (let i = 0; i < routeStops.length - 1; i++) {
      const stopA = routeStops[i];
      const stopB = routeStops[i + 1];

      // Find nearest graph nodes
      const fromNode = nearestNode({ lat: stopA.lat, lon: stopA.lon }, nodeMap, graph, "car", "length");
      const toNode = nearestNode({ lat: stopB.lat, lon: stopB.lon }, nodeMap, graph, "car", "length");

      if (!fromNode || !toNode) {
        console.warn(`⚠️ No node found for ${stopA.name} -> ${stopB.name}`);
        continue;
      }

      const result = aStar(fromNode, toNode, graph, nodeMap, "car", "length");
      if (!result) {
        console.warn(`⚠️ No path for ${stopA.name} -> ${stopB.name}`);
        continue;
      }

      const coords: [number, number][] = result.path.map((nid) => [nodeMap[nid].lon, nodeMap[nid].lat]);

      if (fullCoords.length === 0) fullCoords.push(...coords);
      else fullCoords.push(...coords.slice(1)); // avoid duplicate

      segments.push({ from: stopA.id, to: stopB.id, coords });
    }

    results.push({
      id: route.id,
      name: route.name,
      color: route.lineColor,
      stops: routeStops,
      geometry: fullCoords,
      segments,
    });
  }

  // 3️⃣ Save precomputed routes
  const outPath = path.join("src", "data", "routes_precomputed.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`✅ Precomputation complete. Saved to ${outPath}`);
}

precompute().catch((err) => {
  console.error("❌ Precomputation failed:", err);
  process.exit(1);
});
