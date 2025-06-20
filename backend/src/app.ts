import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors()); //options for origin, methods, credentials and allowheaders

app.use(express.json()); //limit can be define for json payloads
app.use(express.urlencoded({ extended: true })); //for forData (form paylaods)

app.use(express.static("public")); //static folder to public

app.use(cookieParser());

// routes file

import UserRouter from './routes/user.route.js';

app.use('/api/v1/user', UserRouter);

export { app };
