import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { aStar, nearestNode, haversineDistance, textToVector, cosineSimilarity } from '../utils/RouteAlgorithms.js';
import { Request, Response } from "express";
import prisma from "../db/index.js";
import type { AuthenticatedUser, AuthenticatedRequest } from "../middleware/auth.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getLocationName = asyncHandler(async (req: Request, res: Response) => {
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

export const getNearByLocations = asyncHandler(async (req: Request, res: Response) => {
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

  console.log(results);

  return res.status(200)
    .json(
      new ApiResponse(200, results, "Data retrieve successfully")
    );

});

export const insertNewLoacatioins = asyncHandler(async (req: Request, res: Response) => {
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
      new ApiResponse(201, {
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
  // Fetch all destinations
  const results = await prisma.destination.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      lat: true,
      lon: true,
      categories: true,
    },
  });

  // Format response data
  const formattedResults = results.map((dest) => ({
    id: dest.id,
    name: dest.name,
    description: dest.description,
    image: dest.image,
    coordinates: {
      lat: dest.lat,
      lon: dest.lon,
    },
    categories: dest.categories,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedResults, "All locations retrieved successfully")
  );
});



export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { userId, destinationId } = req.body;

  if (!userId || !destinationId) {
    return res.status(400).json({ error: "userId and destinationId are required." });
  }

  // Prevent duplicates
  const existing = await prisma.userFavoriteDestination.findFirst({
    where: {
      userId,
      destinationId,
    },
  });

  if (existing) {
    return res.status(409).json({ message: "Destination already favorited." });
  }

  const favorite = await prisma.userFavoriteDestination.create({
    data: {
      userId,
      destinationId,
    },
  });

  res.status(201).json({ message: "Favorite added", favorite });
});

export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }

  const favorites = await prisma.userFavoriteDestination.findMany({
    where: { userId },
    include: {
      destination: true, // This includes the full Destination data
    },
  });

  // Optional: Clean response structure
  const cleanedFavorites = favorites.map((fav) => ({
    id: fav.id,
    destinationId: fav.destinationId,
    destination: {
      id: fav.destination.id,
      name: fav.destination.name,
      description: fav.destination.description,
      image: fav.destination.image,
      categories: fav.destination.categories,
      lat: fav.destination.lat,
      lon: fav.destination.lon,
    },
  }));

  res.status(200).json({ favorites: cleanedFavorites });
});

export const deleteFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { userId, destinationId } = req.body;

  if (!userId || !destinationId) {
    return res.status(400).json({ error: "userId and destinationId are required." });
  }

  const existing = await prisma.userFavoriteDestination.findFirst({
    where: { userId, destinationId },
  });

  if (!existing) {
    return res.status(404).json({ message: "Favorite not found." });
  }

  await prisma.userFavoriteDestination.delete({
    where: { id: existing.id },
  });

  res.status(200).json({ message: "Favorite removed successfully." });
});

export const getUserRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required in query parameters." });
  }

  // Step 1: Get user's favorites with destination info
  const favorites = await prisma.userFavoriteDestination.findMany({
    where: { userId },
    include: { destination: true },
  });

  if (favorites.length === 0) {
    return res.json({ recommendations: [] });
  }

  const favoriteVectors = favorites.map(({ destination }) =>
    textToVector(`${destination.name} ${destination.description ?? ""} ${destination.categories.join(" ")}`)
  );

  // Step 2: Get all destinations from DB
  const allDestinations = await prisma.destination.findMany();
  const favoritedIds = new Set(favorites.map(f => f.destinationId));

  // Step 3: Score all non-favorited destinations
  const recommendations = allDestinations
    .filter(d => !favoritedIds.has(d.id))
    .map(d => {
      const vector = textToVector(`${d.name} ${d.description ?? ""} ${d.categories.join(" ")}`);
      const avgSimilarity =
        favoriteVectors.reduce((sum, vec) => sum + cosineSimilarity(vector, vec), 0) / favoriteVectors.length;

      return {
        id: d.id,
        name: d.name,
        description: d.description,
        image: d.image,
        categories: d.categories,
        lat: d.lat,
        lon: d.lon,
        similarityScore: avgSimilarity,
      };
    })
    .filter(d => d.similarityScore >= 0.2)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);

  res.json({ recommendations });
});