import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { aStar, nearestNode } from '../utils/RouteAlgorithms.js';
import { graph, nodeMap } from "../index.js";
import prisma from "../db/index.js";
export const getRoute = asyncHandler(async (req, res) => {
    const { start, end } = req.body;
    //  console.log("called");
    // console.log(start);
    //  console.log(end);
    if (!start || !end) {
        throw new ApiError(400, "Coordinates required");
    }
    const startId = nearestNode(start, nodeMap);
    const goalId = nearestNode(end, nodeMap);
    if (!startId || !goalId) {
        throw new ApiError(400, "Nearest Node not found");
    }
    const pathIds = aStar(startId, goalId, graph, nodeMap);
    if (!pathIds) {
        throw new ApiError(400, "All the field required.");
    }
    const pathCoords = pathIds.map(id => {
        const node = nodeMap[id];
        return [node.lat, node.lon];
    });
    res.json({ path: pathCoords });
});
export const getNearByNodes = asyncHandler(async (req, res) => {
    const { lat, lon } = req.body;
    const radiusMeters = 500;
    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required" });
    }
    try {
        const results = await prisma.$queryRawUnsafe(`
    SELECT
      name,
      lat,
      lon,
      categories
    FROM point_of_interests
    WHERE ST_DWithin(
      geom::geography,
      ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
      ${radiusMeters}
    )
  `);
        return res.status(200).json({ results });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
const solveTSP = async (req, res) => {
};
