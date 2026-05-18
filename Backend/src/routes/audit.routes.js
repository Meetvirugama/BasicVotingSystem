import { Router } from "express";
import verifyBackendToken from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import { getAll } from "../controllers/audit.controller.js";

const router = Router();

router.get("/", verifyBackendToken, adminOnly, getAll);

export default router;
