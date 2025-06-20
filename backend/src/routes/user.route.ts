import { registerUser, signIn, logOut } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();
router.route("/register").post(registerUser);
router.route('/signIn').post(signIn);
router.route('/logOut').get(verifyJWT, logOut);

export default router;