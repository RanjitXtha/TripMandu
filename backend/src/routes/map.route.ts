import { Router } from "express";
import { getRecommendations, solveTSPHandler } from "../controllers/map.controller.js";

const router = Router();
router.post("/api/map/solveTsp", solveTSPHandler);
router.post("/api/map/recommend", getRecommendations);

export default router