// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, unique: true },
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role:  { type: String, enum: ["admin", "employee"], required: true },
    mobile:{ type: String },
    photo: { type: String } // optional web path if you keep disk photos for admin area
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
