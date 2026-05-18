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
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Require both valid JWT AND admin role for all autogen routes
router.use(verifyBackendToken);
router.use(adminOnly);

router.get("/settings", getGeneratorSettings);
router.post("/settings", updateGeneratorSettings);
router.get("/queue", getGeneratedPollsQueue);
router.post("/crawl", triggerManualCrawl);
router.post("/approve/:id", approveGeneratedPoll);
router.post("/reject/:id", rejectGeneratedPoll);

export default router;
