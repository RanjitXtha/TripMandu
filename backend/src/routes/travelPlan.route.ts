import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { createPlan } from "../controllers/travelplan.controller.js";


const router = Router();

router.route("/createPlan").post(verifyJWT, createPlan);

export default router;