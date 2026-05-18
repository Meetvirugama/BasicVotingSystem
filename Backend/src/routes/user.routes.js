import express from "express";
import { getProfile, getLeaderboard, updateProfile } from "../controllers/user.controller.js";
import verifyBackendToken from "../middleware/auth.js";

const router = express.Router();

// Public route for leaderboard
router.get("/leaderboard", getLeaderboard);

// Protected routes
router.use(verifyBackendToken);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
