// // server.js
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import { connectDB } from "./config/db.js";
// import path from "path";  // ✅ add this
// import { fileURLToPath } from "url"; // ✅ needed for __dirname equivalent
// import cron from "node-cron";
// import { cleanupOldAttendancePhotos } from "./utils/cleanup.js";

// // routes
// import authRoutes from "./routes/authRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";

// import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// import fileRoutes from "./routes/fileRoutes.js";
// app.use("/api", fileRoutes);


// // ✅ Fix __dirname issue in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "1mb" })); 

// // 🔑 Expose uploaded files
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// app.get("/", (req, res) => res.send("Employee Attendance API is running"));

// // mount under /api to match frontend VITE_API_URL
// app.use("/api", authRoutes);
// app.use("/api", attendanceRoutes);
// app.use("/api", leaveRoutes);
// app.use("/api", adminRoutes);

// // error handlers
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 2000;

// connectDB(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
//   })
//   .catch((err) => {
//     console.error("❌ DB connection failed:", err);
//     process.exit(1);
//   });

// // Run every day at 2 AM
// cron.schedule("0 2 * * *", () => {
//   console.log("🕑 Running daily cleanup job...");
//   cleanupOldAttendancePhotos();
// });







// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { cleanupOldAttendancePhotos } from "./utils/cleanup.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";   // ✅ import here

import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// ✅ Fix __dirname issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();   // ✅ app must be declared before app.use()

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// serve static uploads (still needed for employee profile photos)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => res.send("Employee Attendance API is running"));

// ✅ Mount routes after app is created
app.use("/api", authRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", leaveRoutes);
app.use("/api", adminRoutes);
app.use("/", fileRoutes);   // ✅ moved here (after app = express())

// error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 2000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

// Run daily cleanup job
cron.schedule("0 2 * * *", () => {
  console.log("🕑 Running daily cleanup job...");
  cleanupOldAttendancePhotos();
});
