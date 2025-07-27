import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { aStar, nearestNode, haversineDistance, solveTSP } from '../utils/RouteAlgorithms.js';
import { Request, Response } from "express";
import { graph,nodeMap } from "../index.js";
import prisma from "../db/index.js";

export const getRoute = asyncHandler(async(req: Request, res: Response)=>{
    const {start,end}= req.body;
    console.log("called");
    console.log(start);
    console.log(end);
    if (!start || !end) {
       throw new ApiError(400, "Coordinates required");
    }

    const startId = nearestNode(start, nodeMap);
    const goalId = nearestNode(end, nodeMap);

    if(!startId || !goalId){
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


export const getNearByNodes = asyncHandler(async(req: Request, res: Response)=>{
  const {lat,lon} = req.body;
  const radiusMeters=500;

    if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }
  
  try{

 
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

  return res.status(200).json({results})
   }catch(err){
     return res.status(500).json({message:err})
   }
  

})
interface Location {
  lat: number;
  lon: number;
  id: string;
}

export const solveTSPHandler = asyncHandler(async (req: Request, res: Response) => {
  //console.log("TSP handler called");
  const { destinations }: { destinations: Location[] } = req.body;
  //console.log("Destinations: dfadsfadf", destinations);

  if (!destinations || destinations.length === 0) {
    throw new ApiError(400, "Destinations are required");
  }

  //assocating id and initial order of the destination
const indexToIdMap: { [key: number]: string } = {};

for (let i = 0; i < destinations.length; i++) {
  const id = destinations[i].id;
  indexToIdMap[i] = id;
}

//console.log(indexToIdMap);
  

  if (!Array.isArray(destinations) || destinations.length < 2) {
    throw new ApiError(400, "At least two destinations are required");
  }

  const tspOrder = solveTSP(destinations);
  console.log("TSP Order: ", tspOrder);
  let fullPath: [number, number][] = [];

  for (let i = 0; i < tspOrder.length - 1; i++) {
    const start = destinations[tspOrder[i]];
    const end = destinations[tspOrder[i + 1]];

    const startId = nearestNode(start, nodeMap);
    const goalId = nearestNode(end, nodeMap);

    if (startId === null || goalId === null) {
      throw new ApiError(400, "Nearest node not found for coordinates");
    }

    const pathIds = aStar(startId, goalId, graph, nodeMap);
    if (!pathIds) {
      throw new ApiError(400, "No path found between nodes");
    }

    const pathCoords = pathIds.map((id) => {
      const node = nodeMap[id];
      return [node.lat, node.lon] as [number, number];
    });

    if (i > 0 && pathCoords.length > 0) pathCoords.shift(); // prevent duplicates
    fullPath = fullPath.concat(
      pathCoords.filter((p): p is [number, number] => p.length === 2)
    );
  }

const tspResponse: Record<number, { id: string; order: number }> = {};

tspOrder.forEach((originalIndex, stepIndex) => {
  tspResponse[stepIndex] = {
    id: indexToIdMap[originalIndex],
    order: originalIndex,  // Keep the original index from tspOrder here
  };
});

//console.log("TSP Response: ", tspResponse);


//console.log("TSP Response: ", tspResponse);


  return res.status(200).json({ path: fullPath, tspResponse });
});


export const helloMap = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello from map controller!" });
});


