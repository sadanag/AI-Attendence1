// // // controllers/attendanceController.js
// // import Employee from "../models/Employee.js";
// // import Attendance from "../models/Attendance.js";
// // import { verifyFaces } from "../utils/faceVerification.js";

// // function canAccessEmployee(req, empId) {
// //   return req.user?.role === "admin" || req.user?.empId === empId;
// // }

// // export async function checkIn(req, res) {
// //   try {
// //     const { empId } = req.params;
// //     const { photo } = req.body;

// //     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
// //     if (!photo) return res.status(400).json({ message: "photo (base64) is required" });

// //     const employee = await Employee.findOne({ empId });
// //     if (!employee) return res.status(404).json({ message: "Employee not found" });

// //     // prevent duplicate open check-in
// //     const open = await Attendance.findOne({ employee: employee._id, checkOutTime: { $exists: false } });
// //     if (open) return res.status(400).json({ message: "Already checked in. Please check out first." });

// //     const record = await Attendance.create({
// //       employee: employee._id,
// //       checkInTime: new Date(),
// //       checkInPhoto: photo
// //     });

// //     return res.json({ message: "Checked in successfully", attendanceId: record._id });
// //   } catch (e) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // }

// // export async function checkOut(req, res) {
// //   try {
// //     const { empId } = req.params;
// //     const { photo } = req.body;

// //     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
// //     if (!photo) return res.status(400).json({ message: "photo (base64) is required" });

// //     const employee = await Employee.findOne({ empId });
// //     if (!employee) return res.status(404).json({ message: "Employee not found" });

// //     const open = await Attendance.findOne({ employee: employee._id, checkOutTime: { $exists: false } }).sort({ createdAt: -1 });
// //     if (!open) return res.status(400).json({ message: "No open check-in found" });

// //     // OPTIONAL: verify face between check-in and check-out photos
// //     const ok = await verifyFaces(open.checkInPhoto, photo);
// //     if (!ok) return res.status(400).json({ message: "Face verification failed" });

// //     open.checkOutTime = new Date();
// //     open.checkOutPhoto = photo;
// //     open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
// //     await open.save();

// //     return res.json({ message: "Checked out successfully", workedMs: open.totalMs });
// //   } catch (e) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // }

// // export async function listEmployeeAttendance(req, res) {
// //   try {
// //     const { empId } = req.params;
// //     const { from, to } = req.query;

// //     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });

// //     const employee = await Employee.findOne({ empId });
// //     if (!employee) return res.status(404).json({ message: "Employee not found" });

// //     const q = { employee: employee._id };
// //     if (from || to) {
// //       q.createdAt = {};
// //       if (from) q.createdAt.$gte = new Date(from);
// //       if (to) q.createdAt.$lte = new Date(to);
// //     }

// //     const rows = await Attendance.find(q).sort({ createdAt: -1 });

// //     // Frontend expects array with checkInTime/checkOutTime fields
// //     res.json(rows);
// //   } catch (e) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // }
























// // controllers/attendanceController.js
// import Employee from "../models/Employee.js";
// import Attendance from "../models/Attendance.js";
// import { verifyFaces } from "../utils/faceVerification.js";
// import { pushAttendanceToSAP } from "../services/sapService.js";


// function canAccessEmployee(req, empId) {
//   return req.user?.role === "admin" || req.user?.empId === empId;
// }

// export async function checkIn(req, res) {
//   try {
//     const { empId } = req.params;
//     const { photo } = req.body;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
//     if (!photo) return res.status(400).json({ message: "photo (base64) is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     if (!employee.photo) return res.status(400).json({ message: "No registered photo on file" });

//     // prevent duplicate open check-in
//     const open = await Attendance.findOne({ employee: employee._id, checkOutTime: { $exists: false } });
//     if (open) return res.status(400).json({ message: "Already checked in. Please check out first." });

//     // === DS verification: live vs registered photo
//     const { ok, score } = await verifyFaces(employee.photo, photo);
//     if (!ok) {
//       return res.status(400).json({
//         message: "Face verification failed on check-in",
//         ...(score != null ? { score } : {})
//       });
//     }

//   const record = await Attendance.create({
//   employee: employee._id,
//   checkInTime: new Date(),
//   checkInPhoto: photo
// });

// // push to SAP
// await pushAttendanceToSAP(record, employee);

// return res.json({ message: "Checked in successfully", attendanceId: record._id, score });

//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export async function checkOut(req, res) {
//   try {
//     const { empId } = req.params;
//     const { photo } = req.body;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
//     if (!photo) return res.status(400).json({ message: "photo (base64) is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false }
//     }).sort({ createdAt: -1 });

//     if (!open) return res.status(400).json({ message: "No open check-in found" });

//     // === DS verification: live vs registered photo
//     const primary = await verifyFaces(employee.photo, photo);
//     if (!primary.ok) {
//       return res.status(400).json({
//         message: "Face verification failed on check-out",
//         ...(primary.score != null ? { score: primary.score } : {})
//       });
//     }

//     // OPTIONAL extra check: live vs check-in photo (same person who checked in)
//     // You can toggle this on/off by commenting out the next 5 lines.
//     const secondary = await verifyFaces(open.checkInPhoto, photo);
//     if (!secondary.ok) {
//       return res.status(400).json({
//         message: "Face mismatch with original check-in photo",
//         ...(secondary.score != null ? { score: secondary.score } : {})
//       });
//     }

// open.checkOutTime = new Date();
// open.checkOutPhoto = photo;
// open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
// await open.save();

// // push to SAP
// await pushAttendanceToSAP(open, employee);

// return res.json({
//   message: "Checked out successfully",
//   workedMs: open.totalMs,
//   score: primary.score
// });

//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export async function listEmployeeAttendance(req, res) {
//   try {
//     const { empId } = req.params;
//     const { from, to } = req.query;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const q = { employee: employee._id };
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     const rows = await Attendance.find(q).sort({ createdAt: -1 });
//     res.json(rows);
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// // ========== NEW: admin-only list ==========
// export async function listAllAttendance(req, res) {
//   try {
//     if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });

//     const { from, to, empId } = req.query;
//     const q = {};
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     // Optional filter by specific employee
//     if (empId) {
//       const emp = await Employee.findOne({ empId });
//       if (!emp) return res.json([]); // no such employee => empty
//       q.employee = emp._id;
//     }

//     const rows = await Attendance.find(q)
//       .populate("employee", "empId name email role")
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(rows);
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }






















// // controllers/attendanceController.js
// import Employee from "../models/Employee.js";
// import Attendance from "../models/Attendance.js";
// import { verifyFaces } from "../utils/faceVerification.js";
// import { pushAttendanceToSAP } from "../services/sapService.js";

// function canAccessEmployee(req, empId) {
//   return req.user?.role === "admin" || req.user?.empId === empId;
// }

// const toPublicUrl = (req, fileWebPath) => {
//   if (!fileWebPath) return null;
//   if (/^https?:\/\//i.test(fileWebPath)) return fileWebPath; // already URL
//   const base = `${req.protocol}://${req.get("host")}`;
//   const path = fileWebPath.startsWith("/") ? fileWebPath : `/${fileWebPath}`;
//   return base + path;
// };

// /** ✅ CHECK-IN (Multer) */
// export async function checkIn(req, res) {
//   try {
//     const { empId } = req.params;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
//     if (!req.file) return res.status(400).json({ message: "photo file is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     if (!employee.photo) return res.status(400).json({ message: "No registered photo on file" });

//     // prevent duplicate open check-in
//     const open = await Attendance.findOne({ employee: employee._id, checkOutTime: { $exists: false } });
//     if (open) return res.status(400).json({ message: "Already checked in. Please check out first." });

//     // build web path for just-uploaded photo
//     const liveWebPath = `/uploads/attendance/${req.file.filename}`;

//     // === DS verification: live vs registered photo (send URLs)
//     const regUrl = toPublicUrl(req, employee.photo);
//     const liveUrl = toPublicUrl(req, liveWebPath);
//     const { ok, score } = await verifyFaces(regUrl, liveUrl);
//     if (!ok) {
//       return res.status(400).json({
//         message: "Face verification failed on check-in",
//         ...(score != null ? { score } : {}),
//       });
//     }

//     const fileId = await saveToGridFS(req.file);

// const record = await Attendance.create({
//   employee: employee._id,
//   checkInTime: new Date(),
//   checkInPhoto: fileId,   // store GridFS ObjectId as string
// });


//     await pushAttendanceToSAP(record, employee);

//     return res.json({ message: "Checked in successfully", attendanceId: record._id, score });
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /** ✅ CHECK-OUT (Multer) */
// export async function checkOut(req, res) {
//   try {
//     const { empId } = req.params;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });
//     if (!req.file) return res.status(400).json({ message: "photo file is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     }).sort({ createdAt: -1 });

//     if (!open) return res.status(400).json({ message: "No open check-in found" });

//     const liveWebPath = `/uploads/attendance/${req.file.filename}`;

//     // Primary: registered vs live
//     const primary = await verifyFaces(
//       toPublicUrl(req, employee.photo),
//       toPublicUrl(req, liveWebPath)
//     );
//     if (!primary.ok) {
//       return res.status(400).json({
//         message: "Face verification failed on check-out",
//         ...(primary.score != null ? { score: primary.score } : {}),
//       });
//     }

//     // Secondary (optional): check-in photo vs live (same person)
//     const secondary = await verifyFaces(
//       toPublicUrl(req, open.checkInPhoto),
//       toPublicUrl(req, liveWebPath)
//     );
//     if (!secondary.ok) {
//       return res.status(400).json({
//         message: "Face mismatch with original check-in photo",
//         ...(secondary.score != null ? { score: secondary.score } : {}),
//       });
//     }

//     const fileId = await saveToGridFS(req.file);

// open.checkOutTime = new Date();
// open.checkOutPhoto = fileId;
// open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
// await open.save();

//     await pushAttendanceToSAP(open, employee);

//     return res.json({
//       message: "Checked out successfully",
//       workedMs: open.totalMs,
//       score: primary.score,
//     });
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /** other endpoints (unchanged) */
// export async function listEmployeeAttendance(req, res) {
//   try {
//     const { empId } = req.params;
//     const { from, to } = req.query;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const q = { employee: employee._id };
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     const rows = await Attendance.find(q).sort({ createdAt: -1 });
//     res.json(rows);
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export async function listAllAttendance(req, res) {
//   try {
//     if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });

//     const { from, to, empId } = req.query;
//     const q = {};
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     if (empId) {
//       const emp = await Employee.findOne({ empId });
//       if (!emp) return res.json([]);
//       q.employee = emp._id;
//     }

//     const rows = await Attendance.find(q)
//       .populate("employee", "empId name email role")
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(rows);
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }
// import mongoose from "mongoose";

// async function saveToGridFS(file) {
//   const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//     bucketName: "attendancePhotos",
//   });

//   return new Promise((resolve, reject) => {
//     const uploadStream = bucket.openUploadStream(file.originalname, {
//       contentType: file.mimetype,
//     });
//     uploadStream.end(file.buffer);  // write buffer to GridFS
//     uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
//     uploadStream.on("error", reject);
//   });
// }









// import mongoose from "mongoose";
// import Employee from "../models/Employee.js";
// import Attendance from "../models/Attendance.js";
// import { verifyFaces } from "../utils/faceVerification.js";
// import { pushAttendanceToSAP } from "../services/sapService.js";

// // 🔹 Save file to GridFS
// async function saveToGridFS(file) {
//   if (!file) throw new Error("No file provided");

//   const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//     bucketName: "attendancePhotos",
//   });

//   return new Promise((resolve, reject) => {
//     const uploadStream = bucket.openUploadStream(file.originalname, {
//       contentType: file.mimetype,
//     });

//     uploadStream.end(file.buffer);

//     uploadStream.on("finish", () => {
//       console.log("✅ Stored in GridFS:", uploadStream.id);
//       resolve(uploadStream.id.toString());
//     });

//     uploadStream.on("error", reject);
//   });
// }

// // 🔹 Get public file URL (served by /api/file/:id)
// function fileUrl(req, fileId) {
//   return `${req.protocol}://${req.get("host")}/api/file/${fileId}`;
// }

// function canAccessEmployee(req, empId) {
//   return req.user?.role === "admin" || req.user?.empId === empId;
// }

// /** ✅ CHECK-IN */
// export async function checkIn(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });
//     if (!req.file) return res.status(400).json({ message: "Photo is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     if (!employee.photo)
//       return res.status(400).json({ message: "No registered photo" });

//     // Ensure no open check-in
//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     });
//     if (open)
//       return res
//         .status(400)
//         .json({ message: "Already checked in. Please check out first." });

//     // Save photo to GridFS
//     const fileId = await saveToGridFS(req.file);

//     // Face verification
//     const regUrl = `${req.protocol}://${req.get("host")}${employee.photo}`;
//     const liveUrl = fileUrl(req, fileId);

//     const { ok, score } = await verifyFaces(regUrl, liveUrl);
//     if (!ok)
//       return res.status(400).json({
//         message: "Face verification failed",
//         score,
//       });

//     const record = await Attendance.create({
//       employee: employee._id,
//       checkInTime: new Date(),
//       checkInPhoto: fileId,
//     });

//     await pushAttendanceToSAP(record, employee);

//     res.json({
//       message: "Checked in successfully",
//       attendanceId: record._id,
//       score,
//     });
//   } catch (err) {
//     console.error("Check-in error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /** ✅ CHECK-OUT */
// export async function checkOut(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });
//     if (!req.file) return res.status(400).json({ message: "Photo is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     }).sort({ createdAt: -1 });
//     if (!open) return res.status(400).json({ message: "No open check-in found" });

//     // Save to GridFS
//     const fileId = await saveToGridFS(req.file);

//     // Verify against registered photo
//     const regUrl = `${req.protocol}://${req.get("host")}${employee.photo}`;
//     const liveUrl = fileUrl(req, fileId);

//     const primary = await verifyFaces(regUrl, liveUrl);
//     if (!primary.ok)
//       return res.status(400).json({
//         message: "Face verification failed on check-out",
//         score: primary.score,
//       });

//     // Optional: compare with check-in photo
//     const checkInUrl = fileUrl(req, open.checkInPhoto);
//     const secondary = await verifyFaces(checkInUrl, liveUrl);
//     if (!secondary.ok)
//       return res.status(400).json({
//         message: "Face mismatch with check-in photo",
//         score: secondary.score,
//       });

//     open.checkOutTime = new Date();
//     open.checkOutPhoto = fileId;
//     open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
//     await open.save();

//     await pushAttendanceToSAP(open, employee);

//     res.json({
//       message: "Checked out successfully",
//       workedMs: open.totalMs,
//       score: primary.score,
//     });
//   } catch (err) {
//     console.error("Check-out error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// }








// controllers/attendanceController.js
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { pushAttendanceToSAP } from "../services/sapService.js";

// --- UTIL: wait for Mongo to be ready before using GridFS ---
async function ensureMongoReady() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    await mongoose.connection.asPromise?.();
    if (!mongoose.connection.db) {
      throw new Error("MongoDB not ready: connection.db is undefined");
    }
  }
}

/**
 * Save file buffer to GridFS bucket "attendancePhotos"
 * returns the fileId as string
 */
async function saveToGridFS(file) {
  if (!file) throw new Error("No file provided");
  await ensureMongoReady();

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "attendancePhotos",
  });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname || "upload.bin", {
      contentType: file.mimetype || "application/octet-stream",
    });

    if (!file.buffer || !(file.buffer instanceof Buffer)) {
      return reject(new Error("req.file.buffer missing (expecting memoryStorage)."));
    }

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      console.log("✅ Stored in GridFS:", uploadStream.id);
      resolve(uploadStream.id.toString());
    });

    uploadStream.on("error", (err) => {
      console.error("❌ GridFS upload error:", err);
      reject(err);
    });
  });
}

function canAccessEmployee(req, empId) {
  return req.user?.role === "admin" || req.user?.empId === empId;
}

/** CHECK-IN */
export async function checkIn(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    if (!req.file) {
      console.warn("checkIn: req.file is undefined. Expecting multipart/form-data with field 'photo'.");
      return res.status(400).json({ message: "Photo is required" });
    } else {
      console.log("checkIn: file received", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
      });
    }

    const employee = await Employee.findOne({ empId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Prevent duplicate open check-in
    const open = await Attendance.findOne({
      employee: employee._id,
      checkOutTime: { $exists: false },
    });
    if (open)
      return res.status(400).json({
        message: "Already checked in. Please check out first.",
      });

    // Save photo to GridFS (non-blocking on failure)
    let fileId = null;
    try {
      fileId = await saveToGridFS(req.file);
    } catch (e) {
      console.error("saveToGridFS failed (non-blocking):", e.message);
    }

    const record = await Attendance.create({
      employee: employee._id,
      checkInTime: new Date(),
      ...(fileId ? { checkInPhoto: fileId } : {}),
    });

    try {
      await pushAttendanceToSAP(record, employee);
    } catch (sapErr) {
      console.warn("pushAttendanceToSAP failed (non-blocking):", sapErr.message);
    }

    return res.json({
      message: "Checked in successfully",
      attendanceId: record._id,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** CHECK-OUT */
export async function checkOut(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    if (!req.file) {
      console.warn("checkOut: req.file is undefined. Expecting multipart/form-data with field 'photo'.");
      return res.status(400).json({ message: "Photo is required" });
    } else {
      console.log("checkOut: file received", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
      });
    }

    const employee = await Employee.findOne({ empId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const open = await Attendance.findOne({
      employee: employee._id,
      checkOutTime: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!open)
      return res.status(400).json({ message: "No open check-in found" });

    let fileId = null;
    try {
      fileId = await saveToGridFS(req.file);
    } catch (e) {
      console.error("saveToGridFS failed (non-blocking):", e.message);
    }

    open.checkOutTime = new Date();
    if (fileId) open.checkOutPhoto = fileId;
    open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
    await open.save();

    try {
      await pushAttendanceToSAP(open, employee);
    } catch (sapErr) {
      console.warn("pushAttendanceToSAP failed (non-blocking):", sapErr.message);
    }

    return res.json({
      message: "Checked out successfully",
      workedMs: open.totalMs,
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** EMPLOYEE (or admin) HISTORY — used by your React AttendanceHistory page */
export async function getAttendanceHistory(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    const { from, to } = req.query;

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const q = { employee: employee._id };
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    // Return exactly what your UI expects to map:
    const rows = await Attendance.find(q)
      .sort({ createdAt: -1 })
      .select("_id checkInTime checkOutTime checkInPhoto checkOutPhoto totalMs createdAt")
      .lean();

    return res.json(rows);
  } catch (err) {
    console.error("getAttendanceHistory error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** ADMIN LIST (unchanged) */
export async function listAllAttendance(req, res) {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { from, to, empId } = req.query;
    const q = {};
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    if (empId) {
      const emp = await Employee.findOne({ empId });
      if (!emp) return res.json([]);
      q.employee = emp._id;
    }

    const rows = await Attendance.find(q)
      .populate("employee", "empId name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json(rows);
  } catch (err) {
    console.error("listAllAttendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
