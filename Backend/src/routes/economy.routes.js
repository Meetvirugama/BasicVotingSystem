import express from "express";
import { getBalance, getTransactions, dailyCheckIn } from "../controllers/economy.controller.js";
import verifyBackendToken from "../middleware/auth.js";

const router = express.Router();

// All economy routes require authentication
router.use(verifyBackendToken);

router.get("/balance", getBalance);
router.get("/transactions", getTransactions);
router.post("/check-in", dailyCheckIn);

export default router;
