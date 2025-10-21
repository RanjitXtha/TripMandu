import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../middleware/auth.js";
import prisma from "../db/index.js";
import { connect } from "http2";
import { Prisma } from "@prisma/client";

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

    // const query = `
    //   SELECT
    //     d.id,
    //     d.name,
    //     d.description,
    //     d.image,
    //     ST_Y(d.location::geometry) AS latitude,
    //     ST_X(d.location::geometry) AS longitude,
    //     pd."planId",
    //     pd.order,
    //     pd.date
    //   FROM "PlanDestination" pd
    //   JOIN "Destination" d ON pd."destinationId" = d.id
    //   JOIN "TravelPlan" tp ON tp.id = pd."planId"
    //   WHERE tp."userId" = '${userId}'
    //   ORDER BY pd.date, pd.order;
    // `;

    // const destinations = await prisma.$queryRawUnsafe(query);

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

    // Fetch the travel plan with its destinations and related destination data
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

    // Check if plan exists and belongs to the current user
    if (!travelPlan || travelPlan.userId !== user.id) {
      throw new ApiError(404, "Plan not found or access denied");
    }

    // Prepare the response
    const response = {
      planName: travelPlan.name || "",
      destinations: travelPlan.destinations.map((pd) => ({
        id: pd.destination.id,
        name: pd.destination.name,
        description: pd.destination.description,
        image: pd.destination.image,
        latitude: pd.destination.lat,
        longitude: pd.destination.lon,
        categories: pd.destination.categories,
        order: pd.order,
        date: pd.date ? pd.date.toISOString().split("T")[0] : null,
      })),
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        response,
        "Plan destinations retrieved successfully"
      )
    );
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

