import { Router } from "express";
import { getRoute } from "../controllers/map.controller.js";

 const mapRouter = Router();

mapRouter.route('/api/map/getRoute').post(getRoute)
export default mapRouter