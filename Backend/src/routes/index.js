import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import economyRoutes from "./economy.routes.js";
import categoryRoutes from "./category.routes.js";
import pollRoutes from "./poll.routes.js";
import taskRoutes from "./task.routes.js";
import autogenRoutes from "./autogen.routes.js";
import electionRoutes from "./election.routes.js";
import voteRoutes from "./vote.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/economy", economyRoutes);
router.use("/categories", categoryRoutes);
router.use("/polls", pollRoutes);
router.use("/tasks", taskRoutes);
router.use("/admin/polls/generator", autogenRoutes);
router.use("/elections", electionRoutes);
router.use("/votes", voteRoutes);

export default router;

