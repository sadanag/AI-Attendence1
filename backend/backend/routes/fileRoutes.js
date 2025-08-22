// // routes/fileRoutes.js
// import { Router } from "express";
// import mongoose from "mongoose";

// const router = Router();
// const conn = mongoose.connection;

// router.get("/file/:id", async (req, res) => {
//   try {
//     const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
//       bucketName: "attendancePhotos",
//     });

//     const _id = new mongoose.Types.ObjectId(req.params.id);
//     bucket.openDownloadStream(_id).pipe(res);
//   } catch (err) {
//     res.status(404).json({ message: "File not found" });
//   }
// });

// export default router;




// routes/fileRoutes.js
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

async function ensureMongoReady() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    await mongoose.connection.asPromise?.();
    if (!mongoose.connection.db) {
      throw new Error("MongoDB not ready: connection.db is undefined");
    }
  }
}

router.get("/file/:id", async (req, res) => {
  try {
    await ensureMongoReady();

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid file id" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "attendancePhotos",
    });

    const _id = new mongoose.Types.ObjectId(id);
    const downloadStream = bucket.openDownloadStream(_id);

    // When GridFS finds the file, it emits a 'file' event with metadata
    downloadStream.on("file", (file) => {
      if (file?.contentType) {
        res.setHeader("Content-Type", file.contentType);
      }
      // Optional: suggest a filename
      if (file?.filename) {
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(file.filename)}"`
        );
      }
    });

    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err.message);
      // Missing file or other stream errors return 404
      if (!res.headersSent) {
        res.status(404).json({ message: "File not found" });
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("file route error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
});

export default router;


