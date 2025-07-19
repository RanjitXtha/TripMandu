import { Router } from "express";
import { getRoute, solveTSPHandler } from "../controllers/map.controller.js";
import {getNearByNodes} from "../controllers/map.controller.js";

 const mapRouter = Router();

mapRouter.route('/api/map/getRoute').post(getRoute)
mapRouter.route('/api/map/getNearByNodes').post(getNearByNodes);
mapRouter.post("/api/map-solveTsp", solveTSPHandler);

export default mapRouter