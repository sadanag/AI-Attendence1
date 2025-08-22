import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/axiosInstance';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ems_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ems_token'));

  useEffect(() => {
    if (user) localStorage.setItem('ems_user', JSON.stringify(user));
    else localStorage.removeItem('ems_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('ems_token', token);
    else localStorage.removeItem('ems_token');
  }, [token]);

  const loginWithEmpId = async (empId) => {
    const res = await api.post('/login', { empId });
    // Expect backend to return minimal employee info
    return res.data; // { employee }
  };

  const sendOtp = async ({ empId, mobileNumber }) => {
    const res = await api.post('/send-otp', { empId, mobileNumber });
    return res.data; // { message }
  };

  const verifyOtp = async ({ empId, mobileNumber, otpCode }) => {
    const res = await api.post('/verify-otp', { empId, mobileNumber, otpCode });
    // Expect backend: { token, employee }
    setToken(res.data.token);
    setUser(res.data.employee);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, setUser, setToken, loginWithEmpId, sendOtp, verifyOtp, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
