import { Router } from "express";
import verifyBackendToken from "../middleware/auth.js";
import VoteController from "../controllers/vote.controller.js";
import { voteRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/my", verifyBackendToken, VoteController.getMyVotes);
router.post("/", verifyBackendToken, voteRateLimiter, VoteController.castVote);

// 🔍 PUBLIC VERIFICATION (Does not require login to verify a receipt hash)
router.get("/verify/:hash", VoteController.verifyReceipt);

export default router;
