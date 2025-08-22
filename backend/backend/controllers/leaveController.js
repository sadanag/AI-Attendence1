// controllers/leaveController.js
// import LeaveRequest from "../models/LeaveRequest.js";
// import Employee from "../models/Employee.js";

// export async function createLeaveRequest(req, res) {
//   try {
//     const { employeeId, fromDate, toDate, reason } = req.body;
//     if (!employeeId || !fromDate || !toDate || !reason) {
//       return res.status(400).json({ message: "employeeId, fromDate, toDate, reason are required" });
//     }

//     // Optional: ensure the requester is the same employee unless admin
//     if (req.user.role !== "admin" && String(req.user._id) !== String(employeeId)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     const employee = await Employee.findById(employeeId);
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const doc = await LeaveRequest.create({
//       employeeId,
//       fromDate: new Date(fromDate),
//       toDate: new Date(toDate),
//       reason
//     });

//     res.json({ message: "Leave request submitted", leaveRequest: doc });
//   } catch (e) {
//     res.status(500).json({ message: "Server error" });
//   }
// }





// controllers/leaveController.js
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";

export async function createLeaveRequest(req, res) {
  try {
    const { employeeId, fromDate, toDate, reason } = req.body;
    if (!employeeId || !fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "employeeId, fromDate, toDate, reason are required" });
    }

    // Optional: ensure the requester is the same employee unless admin
    if (req.user.role !== "admin" && String(req.user._id) !== String(employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const doc = await LeaveRequest.create({
      employeeId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason
    });

    // populate employeeId so frontend gets empId/name immediately
    const populated = await doc.populate("employeeId", "empId name");

    res.status(201).json({ message: "Leave request submitted", leaveRequest: populated });
  } catch (e) {
    console.error("createLeaveRequest error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLeaveRequests(req, res) {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      // Employees only see their own requests
      query.employeeId = req.user._id;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "empId name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}
