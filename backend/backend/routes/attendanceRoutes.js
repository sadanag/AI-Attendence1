// // routes/attendanceRoutes.js
// import { Router } from "express";
// import { auth } from "../middlewares/authMiddleware.js";
// import { checkIn, checkOut, listEmployeeAttendance } from "../controllers/attendanceController.js";

// const router = Router();

// // matches frontend: /employee/:empId/checkin | /employee/:empId/checkout | /employee/:empId/attendance
// router.post("/employee/:empId/checkin", auth, checkIn);
// router.post("/employee/:empId/checkout", auth, checkOut);
// router.get("/employee/:empId/attendance", auth, listEmployeeAttendance);

// export default router;









// // routes/attendanceRoutes.js
// import { Router } from "express";
// import { auth } from "../middlewares/authMiddleware.js";
// import {
//   checkIn,
//   checkOut,
//   listAllAttendance,
//   getAttendanceHistory, // NEW
// } from "../controllers/attendanceController.js";
// import { attendancePhotoUpload } from "../middlewares/upload.js";

// const router = Router();

// // employee check-in/out (requires 'photo' multipart field)
// router.post("/employee/:empId/checkin", auth, attendancePhotoUpload.single("photo"), checkIn);
// router.post("/employee/:empId/checkout", auth, attendancePhotoUpload.single("photo"), checkOut);

// // employee (or admin) history for the AttendanceHistory page
// router.get("/employee/:empId/attendance", auth, getAttendanceHistory);

// // admin-only big list (optional)
// router.get("/admin/attendance", auth, listAllAttendance);

// export default router;


// routes/attendanceRoutes.js
import { Router } from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  checkOut,
  listAllAttendance,
  getAttendanceHistory,
} from "../controllers/attendanceController.js";
import { attendancePhotoUpload } from "../middlewares/upload.js";

const router = Router();

// Photo is OPTIONAL now. If no multipart body is sent, req.file stays undefined.
router.post("/employee/:empId/checkin", auth, attendancePhotoUpload.single("photo"), checkIn);
router.post("/employee/:empId/checkout", auth, attendancePhotoUpload.single("photo"), checkOut);

// employee (or admin) history for the AttendanceHistory page
router.get("/employee/:empId/attendance", auth, getAttendanceHistory);

// admin-only big list (optional)
router.get("/admin/attendance", auth, listAllAttendance);

export default router;
