// routes/authRoutes.js
import { Router } from "express";
import { loginByEmpId, sendOtp, verifyOtp } from "../controllers/authController.js";

const router = Router();

// NOTE: matches frontend calls in AuthContext
router.post("/login", loginByEmpId);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
