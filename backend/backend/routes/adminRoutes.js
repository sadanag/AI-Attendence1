// // routes/adminRoutes.js
// import { Router } from "express";
// import { auth, requireRole } from "../middlewares/authMiddleware.js";
// import {
//   getAllEmployees,
//   updateEmployee,
//   deleteEmployee,
//   getAllLeaveRequests,
//   adminUpdateLeaveStatus,
//   createEmployee
// } from "../controllers/adminController.js";
// import { listAllAttendance } from "../controllers/attendanceController.js";

// const router = Router();

// // protect all admin routes
// router.use(auth, requireRole("admin"));

// // Employee routes
// router.get("/admin/employees", getAllEmployees);
// router.post("/admin/employees", createEmployee);
// router.put("/admin/employees/:empId", updateEmployee);
// router.delete("/admin/employees/:empId", deleteEmployee);

// // Leave routes
// router.get("/admin/leave-requests", getAllLeaveRequests);
// router.put("/admin/leave-request", adminUpdateLeaveStatus);
// // NEW: admin-only attendance list
// router.get("/admin/attendance", auth, listAllAttendance);

// export default router;










// routes/adminRoutes.js
import { Router } from "express";
import { auth, requireRole } from "../middlewares/authMiddleware.js";
import {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getAllLeaveRequests,
  adminUpdateLeaveStatus,
  createEmployee,
} from "../controllers/adminController.js";
import { listAllAttendance } from "../controllers/attendanceController.js";
import { employeePhotoUpload } from "../middlewares/upload.js";

const router = Router();

// protect all admin routes
router.use(auth, requireRole("admin"));

// Employee routes
router.get("/admin/employees", getAllEmployees);
router.post("/admin/employees", employeePhotoUpload.single("photo"), createEmployee);
router.put("/admin/employees/:empId", employeePhotoUpload.single("photo"), updateEmployee);
router.delete("/admin/employees/:empId", deleteEmployee);

// Leave routes
router.get("/admin/leave-requests", getAllLeaveRequests);
router.put("/admin/leave-request", adminUpdateLeaveStatus);

// Admin-only attendance list
router.get("/admin/attendance", listAllAttendance);

export default router;









