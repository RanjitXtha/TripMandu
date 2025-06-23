import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { aStar, nearestNode, haversineDistance } from '../utils/RouteAlgorithms.js';
import { Request, Response } from "express";
import { graph,nodeMap } from "../index.js";

export const getRoute = asyncHandler(async(req: Request, res: Response)=>{
    const {start,end}= req.body;
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


