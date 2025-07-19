import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../middleware/auth.js";
import prisma from "../db/index.js";
import { connect } from "http2";

export const createPlan = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(403, "Unauthorized accesss.");
    }

    const { planeName, destinations } = req.body;

    console.log(destinations);

    if (!Array.isArray(destinations) && destinations.length === 0) {
      throw new ApiError(400, "Plan name and destinations are required.");
    }

    const tPlan = await prisma.travelPlan.create({
      data: {
        name: planeName,
        userId: user?.id,
        destinations: {
          create: destinations.map((d: any) => ({
            destination: {
              connect: { id: d.id },
            },
            order: d.order,
            date: d.date ? new Date(d.date) : undefined,
          })),
        },
      },
      include: {
        destinations: {
          include: {
            destination: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, tPlan, "Plan created successfully"));
  }
);
