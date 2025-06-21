import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";
import bcrypt, { compare } from 'bcrypt';
import { CookieOptions } from "express";
import prisma from "../db/index.js";
import jwt from 'jsonwebtoken'
import { dmmfToRuntimeDataModel } from "@prisma/client/runtime/library";
import type { AuthenticatedUser, AuthenticatedRequest } from "../middleware/auth.js";
import { uploadeCloudinary } from "../utils/cloudinary.js";

const generateToken = (id: string) => {
    return jwt.sign({
        id: id,
    },
    process.env.JWT_SECRET as string,
   {
    expiresIn: '10d'
  })
}

export const registerUser = asyncHandler(async(req: Request, res: Response) => {
    const { fName, lName, email, password } = req.body;

    if([fName, lName, email, password].some(f=>f?.trim()==='')) {
        throw new ApiError(400, "All the field required.");
    }

    //if profile handle uploade to cloudinary

  //  console.log(req);
    
   let profileUrl: string | undefined

   if(req.file?.path) {
    const response = await uploadeCloudinary(req.file?.path);
    profileUrl = response?.url;
   }

    const userExist = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if(userExist) {
        throw new ApiError(403, "User already Exist.");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
        data: {
            fName: fName,
            lName: lName,
            email: email,
            password: hashPassword,
            profile: profileUrl
            //profile needed
        }
    })

    const findUserCreate = await prisma.user.findFirst({
        where: {
            id: createUser.id
        },
        select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        profile: true,
        // prfoile needed if exist
    }
    })

    if(!findUserCreate) {
        throw new ApiError(500, "Enter server error.");
    }

    return res.status(201).
        json(new ApiResponse(201, findUserCreate, "User created Successfully."));

});


export const signIn = asyncHandler(async(req:Request, res: Response) => {
    const { email, password } = req.body;

    if(!email || !password) {
        throw new ApiError(400, "Both email and password requied.");
    }

    const userExist = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if(!userExist) {
        throw new ApiError(404, "User not found.");
    }

    const isValid: boolean = await compare(password, userExist.password);

    if(!isValid) {
        throw new ApiError(403, "Unauthorizd access.");
    }

    const accessToken: string = generateToken(userExist.id);

    if(!accessToken) {
        throw new ApiError(500, "Interal server error.");
    }

    const cookieOptios: CookieOptions = {
       httpOnly: true,
        //other optios for
    }

    const loggedUser = await prisma.user.findFirst({
        where: {
            id: userExist.id
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            profile: true,
        }
    });

    if(!loggedUser) {
        throw new ApiError(500, "Enternal server Error.");
    }

   res.status(200)
   .cookie('accessToken', accessToken, cookieOptios)
   .json(
      new ApiResponse(200, {
         user: loggedUser,
         accessToken: accessToken
      }, "User logged in successfully")
   );
});


export const logOut = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const user= req.user;
    if(!user?.id) {
        throw new ApiError(401, "Unauthorized request.");
    }

    const userExist = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })

    if(!userExist) {
        throw new ApiError(403, "Invalid request");
    }

     const cookieOptios: CookieOptions = {
        secure: true,
        //other optios for
    }

    return res.status(200)
        .clearCookie('accessToken', cookieOptios)
        .json(
            new ApiResponse(200, "User logout successfully.")
        )
})

export const protectedRoute = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if(!user?.id) {
        throw new ApiError(403, "Access denied");
    }

    const userExist = await prisma.user.findFirst({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            fName: true,
            lName: true
        }
    });

    if(!userExist) {
        throw new ApiError(403, "Unauthorized access.");
    }

    return res.status(200)
        .json(
            new ApiResponse(200, userExist, "User retrieved successfully.")
        );
});

