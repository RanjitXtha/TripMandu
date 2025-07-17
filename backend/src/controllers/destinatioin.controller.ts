import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { aStar, nearestNode, haversineDistance } from '../utils/RouteAlgorithms.js';
import { Request, Response } from "express";
import { graph,nodeMap } from "../index.js";
import prisma from "../db/index.js";
import type { AuthenticatedUser, AuthenticatedRequest } from "../middleware/auth.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getLocationName = asyncHandler(async(req: Request, res: Response) => {
  const lat = req.query.lat as string | undefined;
  const lon = req.query.long as string | undefined;

  if (!lat || !lon) {
    throw new ApiError(400, "Latitude and longitude are required.");
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, "Invalid latitude or longitude format.");
  }

  const results = await prisma.$queryRawUnsafe<any[]>(`
  SELECT name
  FROM "Destination"
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    1
  )
  LIMIT 1;
`, longitude, latitude);

console.log(results);

return res.status(200)
.json(
    new ApiResponse(200, results, "Data retrieve successfully")
);

});

export const getNearByLocations = asyncHandler(async(req: Request, res: Response) => {
  const lat = req.query.lat as string | undefined;
  const lon = req.query.long as string | undefined;

  if (!lat || !lon) {
    throw new ApiError(400, "Latitude and longitude are required.");
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, "Invalid latitude or longitude format.");
  }

  const results = await prisma.$queryRawUnsafe<any[]>(`
  select id, name, description, image,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lon
  FROM "Destination"
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    2000
  )
  LIMIT 10;
`, longitude, latitude);

//console.log(results);

return res.status(200)
.json(
    new ApiResponse(200, results, "Data retrieve successfully")
);

});

export const insertNewLoacatioins = asyncHandler(async(req: Request, res: Response) => {
    const { name, description, image, latitude, longitude } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    throw new ApiError(400, "Name, latitude, and longitude are required.");
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    throw new ApiError(400, "Invalid latitude or longitude.");
  }

  const result = await prisma.$executeRawUnsafe(`
    INSERT INTO "Destination" (id, name, description, image, location, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), NOW(), NOW())
  `, name, description || null, image || null, lon, lat);

  console.log(result);

  return res.status(201)
        .json(
            new ApiResponse(201,  {
      name,
      description,
      image,
      latitude: lat,
      longitude: lon,
    }, "Data inserted successfully.")
        );
});

export const insertManyLoacatioins = asyncHandler(async (req: Request, res: Response) => {
  const locations = req.body;

  if (!Array.isArray(locations) || locations.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array of location objects.");
  }

  const values: string[] = [];
  const params: any[] = [];

  locations.forEach((loc, index) => {
    const { name, description, image, latitude, longitude } = loc;

    if (!name || latitude === undefined || longitude === undefined) {
      throw new ApiError(400, `Location at index ${index} is missing required fields.`);
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      throw new ApiError(400, `Invalid coordinates at index ${index}.`);
    }


    const paramOffset = index * 5;
    values.push(`(gen_random_uuid(), $${paramOffset + 1}, $${paramOffset + 2}, $${paramOffset + 3}, ST_SetSRID(ST_MakePoint($${paramOffset + 4}, $${paramOffset + 5}), 4326), NOW(), NOW())`);

    params.push(name, description || null, image || null, lon, lat);
  });

  const query = `
    INSERT INTO "Destination" 
    (id, name, description, image, location, "createdAt", "updatedAt")
    VALUES ${values.join(", ")}
  `;

  const result = await prisma.$executeRawUnsafe(query, ...params);

  return res.status(201).json(
    new ApiResponse(201, {
      inserted: result,
      count: locations.length,
    }, "Locations inserted successfully.")
  );
});

export const getAllLocations = asyncHandler(async (req: Request, res: Response) => {
  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      id, name, description, image,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lon
    FROM "Destination"
  `);

  return res.status(200).json(
    new ApiResponse(200, results, "All locations retrieved successfully")
  );
});