// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    checkInPhoto: { type: String },  // GridFS file id (string)
    checkOutPhoto: { type: String }, // GridFS file id (string)
    totalMs: { type: Number }        // computed on checkout
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
