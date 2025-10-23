import { Router } from "express";
import { addFavorite, deleteFavorite, getAllLocations, getFavorites, getLocationName, getNearByLocations, getUserRecommendations, insertManyLoacatioins, insertNewLoacatioins } from "../controllers/destinatioin.controller.js";

const router = Router();

router.route("/insert").post(insertNewLoacatioins);
router.route("/getName").get(getLocationName);
router.route("/getNearbyLocations").get(getNearByLocations);
router.route("/insertMany").post(insertManyLoacatioins);
router.route("/getAllLocations").get(getAllLocations)



router.post("/favorites", addFavorite);
router.get("/getfavorites/:userId",getFavorites);
router.delete("/favorites", deleteFavorite);

router.get("/recommendations", getUserRecommendations);

export default router;