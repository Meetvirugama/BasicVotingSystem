import { Router } from "express";
import verifyBackendToken from "../middleware/auth.js";
import VoteController from "../controllers/vote.controller.js";

const router = Router();

router.get("/my", verifyBackendToken, VoteController.getMyVotes);
router.post("/", verifyBackendToken, VoteController.castVote);

export default router;
