import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); //options for origin, methods, credentials and allowheaders

app.use(express.json()); //limit can be define for json payloads
app.use(express.urlencoded({ extended: true })); //for forData (form paylaods)

app.use(express.static("public")); //static folder to public

app.use(cookieParser());

// routes file

import mapRouter from "./routes/map.route.js";
import router from "./routes/user.route.js";
import destinationRouter from "./routes/destination.route.js";
import planRouter from "./routes/travelPlan.route.js"

app.use('/api/user', router);
app.use("/api/destination", destinationRouter)
app.use("/api/plan", planRouter);
// app.get('/',(req,res)=>{
//   console.log("req made")
//   res.send('Hello')
// })
app.use(mapRouter);
export { app };
