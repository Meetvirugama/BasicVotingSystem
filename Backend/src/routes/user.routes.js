import { Router } from "express";
import verifyBackendToken from "../middleware/auth.js";
import { getProfile , updateProfile } from "../controllers/user.controller.js";

const router = Router();
router.get("/profile", verifyBackendToken, getProfile);
router.put("/profile", verifyBackendToken, updateProfile);

export default router;
