import { registerUser, signIn, logOut, protectedRoute } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.route("/register").post(upload.single('profile')
    ,registerUser);
router.route('/signIn').post(signIn);
router.route('/logOut').get(verifyJWT, logOut);
router.route('/protected').get(verifyJWT, protectedRoute);

export default router;