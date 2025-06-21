import multer, { FileFilterCallback} from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: function(
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ){
        cb(null, './public/temp')
    },
    filename: function(
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error| null, destination: string) =>void ){
            cb(null, file.originalname);
        }
})


export const upload = multer({ storage });