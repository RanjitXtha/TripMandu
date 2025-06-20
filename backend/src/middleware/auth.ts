import prisma from "../db/index.js";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fName?: string;
  lName?: string;
}
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface JWTPayload {
  id: string;
  iat?: number; //token issued at
  exp?: number; //expire at
}

export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   // console.log(req);
    const token = req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    //  console.log(token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken: JWTPayload;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    const user = await prisma.user.findFirst({
        where: {
            id: decodedToken.id
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
        }
    });

    if(!user) {
        throw new ApiError(401, "Invalid access Token");
    }

    req.user = user;
    next();
  }
);
