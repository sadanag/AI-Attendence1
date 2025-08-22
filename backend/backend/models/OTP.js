// models/OTP.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, index: true },
    mobileNumber: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // auto-delete after 5m
  },
  { timestamps: true }
);

export default mongoose.model("OTP", otpSchema);
