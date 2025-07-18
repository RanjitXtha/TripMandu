import { Router } from "express";
import { getAllLocations, getLocationName, getNearByLocations, insertManyLoacatioins, insertNewLoacatioins } from "../controllers/destinatioin.controller.js";
const router = Router();
router.route("/insert").post(insertNewLoacatioins);
router.route("/getName").get(getLocationName);
router.route("/getNearbyLocations").get(getNearByLocations);
router.route("/insertMany").post(insertManyLoacatioins);
router.route("/getAllLocations").get(getAllLocations);
export default router;
