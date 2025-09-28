import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  deposit,
  withdraw,
  transfer,
  getTransactions,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUser);
router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.post("/transfer", protect, transfer);
router.get("/transactions", protect, getTransactions);

export default router;
