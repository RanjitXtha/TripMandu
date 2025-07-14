import { Router } from "express";
import { getRoute } from "../controllers/map.controller.js";
import {getNearByNodes} from "../controllers/map.controller.js";

 const mapRouter = Router();

mapRouter.route('/api/map/getRoute').post(getRoute)
mapRouter.route('/api/map/getNearByNodes').post(getNearByNodes);
export default mapRouter