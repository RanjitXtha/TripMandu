import { Router } from "express";
import { getRecommendations, getRoute, solveTSPHandler } from "../controllers/map.controller.js";
// import {getNearByNodes} from "../controllers/map.controller.js";

 const router = Router();

router.route('/api/map/getRoute').post(getRoute)
// mapRouter.route('/api/map/getNearByNodes').post(getNearByNodes);
router.post("/api/map/solveTsp", solveTSPHandler);
router.post("/api/map/recommend", getRecommendations);

export default router