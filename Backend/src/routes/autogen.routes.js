import express from "express";
import {
  getGeneratorSettings,
  updateGeneratorSettings,
  getGeneratedPollsQueue,
  triggerManualCrawl,
  approveGeneratedPoll,
  rejectGeneratedPoll
} from "../controllers/autogen.controller.js";
import verifyBackendToken from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to protect admin autogen controls
router.use(verifyBackendToken);

router.get("/settings", getGeneratorSettings);
router.post("/settings", updateGeneratorSettings);
router.get("/queue", getGeneratedPollsQueue);
router.post("/crawl", triggerManualCrawl);
router.post("/approve/:id", approveGeneratedPoll);
router.post("/reject/:id", rejectGeneratedPoll);

export default router;
