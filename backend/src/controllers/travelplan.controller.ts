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
      throw new ApiError(403, "Unauthorized accesss.");
    }

    const { planeName, destinations } = req.body;

   // console.log(destinations);

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

export const getPlanByUser = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if(!user || !user.id) {
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
        destinationId: true,
        order: true,
        date: true,
      }
    }
  }
});


  return res.status(200)
  .json(new ApiResponse(200, destinations, "data retrived successfully"))

});

export const getPlanDestinationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const planId = req.query.id as string;
  if (!planId) {
    throw new ApiError(400, "Plan ID is required");
  }

  const destinations = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      tp.name AS "planName",
      d.id,
      d.name,
      d.description,
      d.image,
      ST_Y(d.location::geometry) AS latitude,
      ST_X(d.location::geometry) AS longitude,
      pd.order,
      pd.date
    FROM "PlanDestination" pd
    JOIN "Destination" d ON pd."destinationId" = d.id
    JOIN "TravelPlan" tp ON tp.id = pd."planId"
    WHERE tp.id = $1 AND tp."userId" = $2
    ORDER BY pd.order ASC;
  `, planId, user.id);

  if (!destinations || destinations.length === 0) {
    throw new ApiError(404, "No destinations found for this plan");
  }

  const planName = destinations[0].planName;

  const response = {
    planName,
    destinations: destinations.map(dest => ({
      id: dest.id,
      name: dest.name,
      description: dest.description,
      image: dest.image,
      latitude: dest.latitude,
      longitude: dest.longitude,
      order: dest.order,
      date: dest.date?.toISOString().split("T")[0] || null
    }))
  };

  return res.status(200).json(new ApiResponse(200, response, "Plan destinations retrieved successfully"));
});

export const deletePlanById = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if(!user || !user.id) {
    throw new ApiError(401, "Unauthrorized acccess");
  }

  const id = req.query.id as string;

  if(!id) {
    throw new ApiError(403, "Unauthorized access");
  }

  const plan = await prisma.travelPlan.findUnique(
    {
      where: {id}
    }
  );

  if(!plan) {
    throw new ApiError(404, "Plan doesnot exist.");
  }

 await prisma.planDestination.deleteMany({
  where: { planId: id }, 
});


await prisma.travelPlan.delete({
  where: { id },
});

  return res.status(200)
       .json(new ApiResponse(200, {}, "Plan Destination deleted successfully."));
})

export const updatePlanById = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if(!user || !user.id) {
    throw new ApiResponse(401, "Unauthorized access");
  }

  const id = req.query.id as string;

  if(!id) {
    throw new ApiError(403, "Id not found");
  }

  const { planeName, destinations} = req.body;

  if(!planeName || !Array.isArray(destinations) || destinations.length === 0) {
    throw new ApiError(403, "ALl fields required");
  }

  const existingPlan = await prisma.travelPlan.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingPlan) {
    throw new ApiError(404, "Travel plan not found");
  }

    const updatedPlan = await prisma.travelPlan.update({
    where: { id },
    data: {
      name: planeName,
      destinations: {
        deleteMany: {},
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

  return res.status(200)
      .json(new ApiResponse(200, updatedPlan, "Plan updated successfully."));

})
