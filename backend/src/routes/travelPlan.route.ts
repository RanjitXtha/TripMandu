import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { createPlan, getPlanByUser, getPlanDestinationById } from "../controllers/travelplan.controller.js";


const router = Router();

router.route("/createPlan").post(verifyJWT, createPlan);
router.route("/getAllPlan").get(verifyJWT, getPlanByUser);
router.route("/getPlanDestinationById").get(verifyJWT, getPlanDestinationById)

export default router;