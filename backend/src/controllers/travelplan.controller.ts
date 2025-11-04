import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../middleware/auth.js";
import prisma from "../db/index.js";
import { aStar, CostType, nearestNode } from "../utils/RouteAlgorithms.js";
import { Mode, SPEEDS } from "./map.controller.js";
import { graphCache } from "../index.js";

export const createPlan = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(403, "Unauthorized access.");
    }

    const { name, destinations } = req.body;

    // if (!p || planName.trim() === "") {
    //   throw new ApiError(400, "Plan name is required.");
    // }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      throw new ApiError(400, "Destinations are required.");
    }

    // Optional: sort destinations by order
    destinations.sort((a: any, b: any) => a.order - b.order);

    const tPlan = await prisma.travelPlan.create({
      data: {
        name: name,
        userId: user.id,
        destinations: {
          create: destinations.map((d: any) => ({
            destination: { connect: { id: d.id } },
            order: d.order,
            date: d.date ? new Date(d.date) : undefined,
          })),
        },
      },
      include: {
        destinations: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            date: true,
            destination: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, tPlan, "Plan created successfully"));
  }
);


export const getPlanByUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user || !user.id) {
      throw new ApiError(401, "Unauthorized access.");
    }

    const userId = user.id; // make sure this is safe!

    const destinations = await prisma.travelPlan.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        destinations: {
          select: {
            id: true,
            destination: {
              select: {
                id: true,
                name: true,
              },
            },
            order: true,
            date: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, destinations, "data retrived successfully"));
  }
);

export const getPlanDestinationById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    const planId = req.query.id as string;
    if (!planId) {
      throw new ApiError(400, "Plan ID is required");
    }

    // Fetch travel plan (ordered destinations)
    const travelPlan = await prisma.travelPlan.findUnique({
      where: { id: planId },
      include: {
        destinations: {
          orderBy: { order: "asc" },
          select: {
            order: true,
            date: true,
            destination: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                lat: true,
                lon: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    if (!travelPlan || travelPlan.userId !== user.id) {
      throw new ApiError(404, "Plan not found or access denied");
    }

    const destinations = travelPlan.destinations.map((pd) => ({
      id: pd.destination.id,
      name: pd.destination.name,
      description: pd.destination.description,
      image: pd.destination.image,
      latitude: pd.destination.lat,
      longitude: pd.destination.lon,
      categories: pd.destination.categories,
      order: pd.order,
      date: pd.date ? pd.date.toISOString().split("T")[0] : null,
    }));

    if (destinations.length < 2) {
      return res.status(200).json(
        new ApiResponse(200, { planName: travelPlan.name, destinations }, "Plan retrieved")
      );
    }

    // Ensure graph cache exists
    if (!graphCache) throw new ApiError(500, "Graph not loaded");

    const { graph, nodeMap } = graphCache;
    const transportMode: Mode = "car" as Mode;
    const costType: CostType = "length";
    const speed = SPEEDS[transportMode];

    // Snap destinations to nearest nodes

    const destinationNodes: Array<{ dest: typeof destinations[0]; nodeId: number }> = [];
    for (const dest of destinations) {
      const nearest = nearestNode(
        { lat: dest.latitude!, lon: dest.longitude! },
        nodeMap,
        graph,
        transportMode,
        costType,
        speed
      );

      if (nearest == null) {
        console.warn(`No nearest node found for destination: ${dest.name}`);
        continue;
      }

      destinationNodes.push({ dest, nodeId: nearest });
    }

    if (destinationNodes.length < 2) {
      return res.status(200).json(
        new ApiResponse(200, { planName: travelPlan.name, destinations }, "Plan retrieved")
      );
    }

    // Prepare route points for round-trip
    const routeNodeIds = destinationNodes.map(d => d.nodeId);
    routeNodeIds.push(routeNodeIds[0]); // return to start

    const segments: Array<{
      path: number[];
      cost: number;
      distance: number;
      fromIndex: number;
      toIndex: number;
    }> = [];

    let totalDistance = 0;
    let totalCost = 0;
    const fullPath: number[] = [];

    // Run A* between consecutive nodes
    for (let i = 0; i < routeNodeIds.length - 1; i++) {
      const fromNode = routeNodeIds[i];
      const toNode = routeNodeIds[i + 1];

      const result = aStar(fromNode, toNode, graph, nodeMap, transportMode, costType, speed);
      if (!result) {
        console.warn(`A* failed between nodes ${fromNode} -> ${toNode}`);
        continue;
      }

      segments.push({
        path: result.path,
        cost: result.totalCost,
        distance: result.totalDistance,
        fromIndex: i,
        toIndex: (i + 1) % destinationNodes.length,
      });

      totalCost += result.totalCost;
      totalDistance += result.totalDistance;

      if (i === 0) fullPath.push(...result.path);
      else fullPath.push(...result.path.slice(1));
    }

    // Convert node IDs to coordinates for frontend
    const fullPathCoords = fullPath.map(id => [nodeMap[id].lat, nodeMap[id].lon]);

    const factor = transportMode === "foot" ? 1.3 : transportMode === "motorbike" ? 1.4 : 1.5;

    const segmentsCoords = segments.map(seg => ({
      path: seg.path.map(id => [nodeMap[id].lat, nodeMap[id].lon]),
      costMinutes: (seg.cost * factor) / 60,
      distanceKm: seg.distance / 1000,
      fromIndex: seg.fromIndex,
      toIndex: seg.toIndex,
    }));

    const response = {
      planName: travelPlan.name,
      destinations,
      route: {
        path: fullPathCoords,
        segments: segmentsCoords,
        totalCostMinutes: (totalCost * factor) / 60,
        totalDistanceKm: totalDistance / 1000,
        mode: transportMode,
        costType,
        roundTrip: true,
      },
    };

    return res.status(200).json(new ApiResponse(200, response, "Round-trip plan retrieved and routed"));
  }
);



export const deletePlanById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user || !user.id) {
      throw new ApiError(401, "Unauthrorized acccess");
    }

    const id = req.query.id as string;

    if (!id) {
      throw new ApiError(403, "Unauthorized access");
    }

    const plan = await prisma.travelPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new ApiError(404, "Plan doesnot exist.");
    }

    await prisma.planDestination.deleteMany({
      where: { planId: id },
    });

    await prisma.travelPlan.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Plan Destination deleted successfully."));
  }
);

export const updatePlanById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    const id = req.query.id as string;
    if (!id) {
      throw new ApiError(400, "Plan ID is required");
    }

    const { name, destinations } = req.body;

    if (!name || !Array.isArray(destinations) || destinations.length === 0) {
      throw new ApiError(400, "Plan name and destinations are required");
    }

    const existingPlan = await prisma.travelPlan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingPlan) {
      throw new ApiError(404, "Travel plan not found");
    }

    // Optional: sort destinations by order
    destinations.sort((a: any, b: any) => a.order - b.order);

    const updatedPlan = await prisma.travelPlan.update({
      where: { id },
      data: {
        name: name,
        destinations: {
          deleteMany: {}, // fully replace old destinations
          create: destinations.map((d: any) => ({
            destination: { connect: { id: d.id } },
            order: d.order,
            date: d.date ? new Date(d.date) : undefined,
          })),
        },
      },
      include: {
        destinations: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            date: true,
            destination: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Format response like getPlanDestinationById
    const response = {
      planName: updatedPlan.name || "",
      destinations: updatedPlan.destinations.map((pd) => ({
        id: pd.destination.id,
        name: pd.destination.name,
        order: pd.order,
        date: pd.date ? pd.date.toISOString().split("T")[0] : null,
      })),
    };

    return res.status(200).json(
      new ApiResponse(200, response, "Plan updated successfully.")
    );
  }
);

