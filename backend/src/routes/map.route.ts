import { Router } from "express";
import { getRoute, helloMap, solveTSPHandler } from "../controllers/map.controller.js";
import {getNearByNodes} from "../controllers/map.controller.js";

 const mapRouter = Router();

mapRouter.route('/getRoute').post(getRoute)
mapRouter.route('/getNearByNodes').post(getNearByNodes);
mapRouter.route('/solveTsp').post(solveTSPHandler);
mapRouter.route('/hello').get((req, res) => {
  res.status(200).json({ message: "Hello from map route!" });
});
mapRouter.route("/helloMap").get(helloMap);

export default mapRouter;