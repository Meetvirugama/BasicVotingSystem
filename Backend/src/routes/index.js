import { Router } from "express";
import authRoutes from "./auth.routes.js";
import voteRoutes from "./vote.routes.js";
import userRoutes from "./user.routes.js";
import electionRoutes from "./election.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/vote", voteRoutes);
router.use("/user", userRoutes);
router.use("/election", electionRoutes);

export default router;
