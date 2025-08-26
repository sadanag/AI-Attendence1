
// controllers/adminController.js
import fs from "fs";
import path from "path";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";

const unlinkIfExists = (webPath) => {
  try {
    if (!webPath) return;
    const rel = webPath.replace(/^\//, ""); // strip starting slash
    const abs = path.join(process.cwd(), rel);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

export async function getAllEmployees(req, res) {
  const rows = await Employee.find().sort({ createdAt: -1 });
  res.json(rows);
}

export async function deleteEmployee(req, res) {
  const { empId } = req.params;
  const doc = await Employee.findOneAndDelete({ empId });
  if (!doc) return res.status(404).json({ message: "Employee not found" });

  // clean up photo file
  unlinkIfExists(doc.photo);

  res.json({ message: "Employee deleted" });
}

export async function getAllLeaveRequests(req, res) {
  const rows = await LeaveRequest.find()
    .populate("employeeId", "empId name")
    .sort({ createdAt: -1 });
  res.json(rows);
}

export async function adminUpdateLeaveStatus(req, res) {
  const { leaveRequestId, status } = req.body;
  if (!leaveRequestId || !["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid leaveRequestId or status" });
  }
  const doc = await LeaveRequest.findByIdAndUpdate(
    leaveRequestId,
    { status },
    { new: true }
  ).populate("employeeId", "empId name");
  if (!doc) return res.status(404).json({ message: "Leave request not found" });
  res.json({ message: `Leave ${status.toLowerCase()}`, leaveRequest: doc });
}

/** ✅ CREATE EMPLOYEE (Multer) */
export async function createEmployee(req, res) {
  try {
    const { empId, name, email, role, mobile } = req.body;

    if (!empId || !name || !email || !role || !mobile) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Employee photo (file) is required" });
    }

    const existingEmployee = await Employee.findOne({ empId });
    if (existingEmployee) {
      // remove uploaded file if duplicate
      unlinkIfExists(`/uploads/employees/${req.file.filename}`);
      return res.status(400).json({ message: "Employee with this ID already exists" });
    }

    const photo = `/uploads/employees/${req.file.filename}`; // web path
    const employee = new Employee({ empId, name, email, role, mobile, photo });
    await employee.save();

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Error creating employee", error: error.message });
  }
}

/** ✅ UPDATE EMPLOYEE (Multer optional) */
export async function updateEmployee(req, res) {
  try {
    const { empId } = req.params;
    const emp = await Employee.findOne({ empId });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const allowed = ["name", "email", "role", "mobile"];
    for (const k of allowed) {
      if (k in req.body) emp[k] = req.body[k];
    }

    if (req.file) {
      // replace old photo file
      unlinkIfExists(emp.photo);
      emp.photo = `/uploads/employees/${req.file.filename}`;
    }

    await emp.save();
    res.json({ message: "Employee updated successfully", employee: emp });
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error: error.message });
  }
}























