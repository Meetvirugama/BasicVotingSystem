import express from "express";
import { getTaskCategories, getTasks, startTask, verifyTask } from "../controllers/task.controller.js";
import verifyBackendToken from "../middleware/auth.js";
import { fraudDetector } from "../middleware/fraud_detector.js"; // We will create this

const router = express.Router();

router.use(verifyBackendToken);

router.get("/categories", getTaskCategories);
router.get("/", getTasks);
router.post("/:id/start", fraudDetector, startTask);
router.post("/:id/verify", fraudDetector, verifyTask);

export default router;
