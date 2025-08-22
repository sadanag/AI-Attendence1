// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

export async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = user; // attach employee doc
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
