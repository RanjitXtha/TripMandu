import { Router } from "express";
import { getRoute, solveTSPHandler } from "../controllers/map.controller.js";
// import {getNearByNodes} from "../controllers/map.controller.js";

 const router = Router();

router.route('/api/map/getRoute').post(getRoute)
// mapRouter.route('/api/map/getNearByNodes').post(getNearByNodes);
router.post("/api/map/solveTsp", solveTSPHandler);

export default router