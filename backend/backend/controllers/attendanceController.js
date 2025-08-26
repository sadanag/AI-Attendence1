
// // controllers/attendanceController.js
// import mongoose from "mongoose";
// import Employee from "../models/Employee.js";
// import Attendance from "../models/Attendance.js";
// import { pushAttendanceToSAP } from "../services/sapService.js";

// // --- UTIL: wait for Mongo to be ready before using GridFS ---
// async function ensureMongoReady() {
//   if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
//     await mongoose.connection.asPromise?.();
//     if (!mongoose.connection.db) {
//       throw new Error("MongoDB not ready: connection.db is undefined");
//     }
//   }
// }

// /**
//  * Save file buffer to GridFS bucket "attendancePhotos"
//  * returns the fileId as string
//  */
// async function saveToGridFS(file) {
//   if (!file) throw new Error("No file provided");
//   await ensureMongoReady();

//   const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//     bucketName: "attendancePhotos",
//   });

//   return new Promise((resolve, reject) => {
//     const uploadStream = bucket.openUploadStream(file.originalname || "upload.bin", {
//       contentType: file.mimetype || "application/octet-stream",
//     });

//     if (!file.buffer || !(file.buffer instanceof Buffer)) {
//       return reject(new Error("req.file.buffer missing (expecting memoryStorage)."));
//     }

//     uploadStream.end(file.buffer);

//     uploadStream.on("finish", () => {
//       console.log("✅ Stored in GridFS:", uploadStream.id);
//       resolve(uploadStream.id.toString());
//     });

//     uploadStream.on("error", (err) => {
//       console.error("❌ GridFS upload error:", err);
//       reject(err);
//     });
//   });
// }

// function canAccessEmployee(req, empId) {
//   return req.user?.role === "admin" || req.user?.empId === empId;
// }

// /** CHECK-IN */
// export async function checkIn(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });

//     if (!req.file) {
//       console.warn("checkIn: req.file is undefined. Expecting multipart/form-data with field 'photo'.");
//       return res.status(400).json({ message: "Photo is required" });
//     } else {
//       console.log("checkIn: file received", {
//         fieldname: req.file.fieldname,
//         originalname: req.file.originalname,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//         hasBuffer: !!req.file.buffer,
//       });
//     }

//     const employee = await Employee.findOne({ empId });
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     // Prevent duplicate open check-in
//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     });
//     if (open)
//       return res.status(400).json({
//         message: "Already checked in. Please check out first.",
//       });

//     // Save photo to GridFS (non-blocking on failure)
//     let fileId = null;
//     try {
//       fileId = await saveToGridFS(req.file);
//     } catch (e) {
//       console.error("saveToGridFS failed (non-blocking):", e.message);
//     }

//     const record = await Attendance.create({
//       employee: employee._id,
//       checkInTime: new Date(),
//       ...(fileId ? { checkInPhoto: fileId } : {}),
//     });

//     try {
//       await pushAttendanceToSAP(record, employee);
//     } catch (sapErr) {
//       console.warn("pushAttendanceToSAP failed (non-blocking):", sapErr.message);
//     }

//     return res.json({
//       message: "Checked in successfully",
//       attendanceId: record._id,
//     });
//   } catch (err) {
//     console.error("Check-in error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** CHECK-OUT */
// export async function checkOut(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });

//     if (!req.file) {
//       console.warn("checkOut: req.file is undefined. Expecting multipart/form-data with field 'photo'.");
//       return res.status(400).json({ message: "Photo is required" });
//     } else {
//       console.log("checkOut: file received", {
//         fieldname: req.file.fieldname,
//         originalname: req.file.originalname,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//         hasBuffer: !!req.file.buffer,
//       });
//     }

//     const employee = await Employee.findOne({ empId });
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found" });

//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     }).sort({ createdAt: -1 });

//     if (!open)
//       return res.status(400).json({ message: "No open check-in found" });

//     let fileId = null;
//     try {
//       fileId = await saveToGridFS(req.file);
//     } catch (e) {
//       console.error("saveToGridFS failed (non-blocking):", e.message);
//     }

//     open.checkOutTime = new Date();
//     if (fileId) open.checkOutPhoto = fileId;
//     open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
//     await open.save();

//     try {
//       await pushAttendanceToSAP(open, employee);
//     } catch (sapErr) {
//       console.warn("pushAttendanceToSAP failed (non-blocking):", sapErr.message);
//     }

//     return res.json({
//       message: "Checked out successfully",
//       workedMs: open.totalMs,
//     });
//   } catch (err) {
//     console.error("Check-out error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** EMPLOYEE (or admin) HISTORY — used by your React AttendanceHistory page */
// export async function getAttendanceHistory(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });

//     const { from, to } = req.query;

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const q = { employee: employee._id };
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     // Return exactly what your UI expects to map:
//     const rows = await Attendance.find(q)
//       .sort({ createdAt: -1 })
//       .select("_id checkInTime checkOutTime checkInPhoto checkOutPhoto totalMs createdAt")
//       .lean();

//     return res.json(rows);
//   } catch (err) {
//     console.error("getAttendanceHistory error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** ADMIN LIST (unchanged) */
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
//   } catch (err) {
//     console.error("listAllAttendance error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
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

/** CHECK-IN (photo OPTIONAL) */
export async function checkIn(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    // Log if a file came, but do NOT require it
    if (req.file) {
      console.log("checkIn: file received", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
      });
    } else {
      console.log("checkIn: proceeding without photo");
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

    // Save photo to GridFS only if file is present (optional)
    let fileId = null;
    if (req.file) {
      try {
        fileId = await saveToGridFS(req.file);
      } catch (e) {
        console.error("saveToGridFS failed (non-blocking):", e.message);
      }
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

/** CHECK-OUT (photo OPTIONAL) */
export async function checkOut(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    // Log if a file came, but do NOT require it
    if (req.file) {
      console.log("checkOut: file received", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
      });
    } else {
      console.log("checkOut: proceeding without photo");
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
    if (req.file) {
      try {
        fileId = await saveToGridFS(req.file);
      } catch (e) {
        console.error("saveToGridFS failed (non-blocking):", e.message);
      }
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
