import express from "express";
import { createPoll, getPolls, getPollById, predictPoll } from "../controllers/poll.controller.js";
import verifyBackendToken from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware globally
router.use(verifyBackendToken);

router.get("/", getPolls);
router.get("/:id", getPollById);
router.post("/", createPoll);
router.post("/:id/predict", predictPoll);

export default router;
