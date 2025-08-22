// routes/leaveRoutes.js
import { Router } from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { createLeaveRequest ,getLeaveRequests} from "../controllers/leaveController.js";

const router = Router();

router.post("/leave-request", auth, createLeaveRequest);

// GET /leave-requests -> return requests for logged-in user (or all if admin)
router.get("/leave-requests", auth, getLeaveRequests);

export default router;
