import { Router } from "express";
import verifyBackendToken from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  create,
  getAll,
  update,
  getOne,
  deleteElection,
  close
} from "../controllers/election.controller.js";

const router = Router();

router.get("/", verifyBackendToken, getAll);

router.get("/:id", verifyBackendToken, getOne);

router.post("/", verifyBackendToken, adminOnly, create);

router.put("/:id", verifyBackendToken, adminOnly, update);

router.delete("/:id", verifyBackendToken, adminOnly, deleteElection);

router.put("/:id/close", verifyBackendToken, adminOnly, close);

export default router;
