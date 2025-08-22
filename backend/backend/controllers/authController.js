// controllers/authController.js
import Employee from "../models/Employee.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/otpGenerator.js";

export async function loginByEmpId(req, res) {
  try {
    const { empId } = req.body;
    if (!empId) return res.status(400).json({ message: "empId is required" });

    const employee = await Employee.findOne({ empId });
    if (!employee) {
      // You can choose to auto-create on first login by empId if you want.
      return res.status(404).json({ message: "Employee ID not found" });
    }

    // Frontend expects: { employee }
    return res.json({ employee: {
      _id: employee._id,
      empId: employee.empId,
      name: employee.name,
      mobileNumber: employee.mobileNumber,
      role: employee.role,
      companyName: employee.companyName
    }});
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function sendOtp(req, res) {
  try {
    const { empId, mobileNumber } = req.body;
    if (!empId || !mobileNumber) {
      return res.status(400).json({ message: "empId and mobileNumber are required" });
    }

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const code = generateOtp(6);

    await OTP.create({ empId, mobileNumber, code });

    // TODO: integrate SMS gateway. For demo, log to server.
    console.log(`OTP for ${empId} (${mobileNumber}): ${code}`);

    return res.json({ message: "OTP sent to mobile" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { empId, mobileNumber, otpCode } = req.body;
    if (!empId || !mobileNumber || !otpCode) {
      return res.status(400).json({ message: "empId, mobileNumber and otpCode are required" });
    }

    const record = await OTP.findOne({ empId, mobileNumber }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: "OTP not found. Please request again" });

    // 5-minute expiry is enforced by TTL index; still check:
    if (Date.now() - record.createdAt.getTime() > 5 * 60 * 1000) {
      return res.status(400).json({ message: "OTP expired. Request a new one" });
    }

    if (record.code !== otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // success — update employee mobile if empty or changed
    const employee = await Employee.findOneAndUpdate(
      { empId },
      { mobileNumber },
      { new: true }
    );

    // issue JWT
    const token = jwt.sign(
      { sub: employee._id, empId: employee.empId, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // optional: delete used OTPs for cleanliness
    await OTP.deleteMany({ empId });

    return res.json({
      token,
      employee: {
        _id: employee._id,
        empId: employee.empId,
        name: employee.name,
        mobileNumber: employee.mobileNumber,
        role: employee.role,
        companyName: employee.companyName
      }
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}
