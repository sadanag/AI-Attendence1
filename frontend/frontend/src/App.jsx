import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginByEmpId from './pages/LoginByEmpId';
import MobileOtp from './pages/MobileOtp';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Leave from './pages/Leave';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminAttendance from "./pages/AdminAttendance";


export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginByEmpId />} />
      <Route path="/mobile-otp" element={<MobileOtp />} />

      {/* Employee Protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute roles={["employee", "admin"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute roles={["employee", "admin"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute roles={["employee", "admin"]}>
            <AttendanceHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute roles={["employee", "admin"]}>
            <Leave />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />

      <Route path="/admin/attendance" element={<AdminAttendance />} />
    </Routes>
  );
}
