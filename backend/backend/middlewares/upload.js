// // middlewares/upload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// function ensureDir(dir) {
//   fs.mkdirSync(dir, { recursive: true });
// }

// function storageFor(subdir) {
//   const dest = path.join(process.cwd(), "uploads", subdir);
//   ensureDir(dest);
//   return multer.diskStorage({
//     destination: (req, file, cb) => cb(null, dest),
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname) || ".jpg";
//       const base = path.basename(file.originalname, ext)
//         .replace(/\s+/g, "_")
//         .toLowerCase();
//       const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, `${base}-${unique}${ext}`);
//     },
//   });
// }

// const imageOnly = (req, file, cb) => {
//   if (/^image\//.test(file.mimetype)) cb(null, true);
//   else cb(new Error("Only image uploads are allowed"), false);
// };

// export const employeePhotoUpload = multer({
//   storage: storageFor("employees"),
//   fileFilter: imageOnly,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// export const attendancePhotoUpload = multer({
//   storage: storageFor("attendance"),
//   fileFilter: imageOnly,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });


// middlewares/upload.js
// import multer from "multer";
// import { GridFsStorage } from "multer-gridfs-storage";
// import dotenv from "dotenv";

// dotenv.config();

// const storage = new GridFsStorage({
//   url: process.env.MONGO_URI,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   file: (req, file) => {
//     return {
//       bucketName: "attendancePhotos", // collection name in MongoDB
//       filename: `${Date.now()}-${file.originalname}`,
//     };
//   },
// });

// export const attendancePhotoUpload = multer({ storage });


// import multer from "multer";

// // Store files in memory, then push to GridFS manually
// export const attendancePhotoUpload = multer({ storage: multer.memoryStorage() });






import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directory
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function storageFor(subdir) {
  const dest = path.join(process.cwd(), "uploads", subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const base = path.basename(file.originalname, ext)
        .replace(/\s+/g, "_")
        .toLowerCase();
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    },
  });
}

const imageOnly = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image uploads are allowed"), false);
};

// ✅ Employee photos (disk)
export const employeePhotoUpload = multer({
  storage: storageFor("employees"),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ Attendance photos (GridFS via memory)
export const attendancePhotoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});
