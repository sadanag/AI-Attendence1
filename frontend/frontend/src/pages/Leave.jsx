// import React, { useState } from 'react';
// import Navbar from '../components/Navbar';
// import api from '../services/axiosInstance';
// import { useAuth } from '../context/AuthContext';

// export default function Leave() {
//   const { user } = useAuth();
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [reason, setReason] = useState('');
//   const [msg, setMsg] = useState('');
//   const [error, setError] = useState('');

//   const submit = async (e) => {
//     e.preventDefault();
//     setMsg(''); setError('');
//     try {
//       await api.post('/leave-request', { employeeId: user._id, fromDate, toDate, reason });
//       setMsg('Leave request submitted');
//       setFromDate(''); setToDate(''); setReason('');
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Failed to submit');
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <main className="container">
//         <section className="card">
//           <h2>Request Leave</h2>
//           <form className="grid" onSubmit={submit}>
//             <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
//             <label>To Date<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
//             <label>Reason<textarea value={reason} onChange={(e) => setReason(e.target.value)} /></label>
//             <button className="btn" type="submit">Submit</button>
//           </form>
//           {msg && <div className="success">{msg}</div>}
//           {error && <div className="error">{error}</div>}
//         </section>
//       </main>
//     </>
//   );
// }



















import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './leave.css';

export default function Leave() {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchLeaveRequests = async () => {
    try {
      const res = await api.get('/leave-requests');
      setLeaveRequests(res.data);
    } catch (err) {
      console.error("Error fetching leave requests", err);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/leave-request', {
        employeeId: user._id,
        fromDate,
        toDate,
        reason
      });
      setMsg('Leave request submitted');
      setFromDate('');
      setToDate('');
      setReason('');
      fetchLeaveRequests(); // refresh list
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="card">
          <h2>Request Leave</h2>
          <form className="grid" onSubmit={submit}>
            <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
            <label>To Date<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
            <label>Reason<textarea value={reason} onChange={(e) => setReason(e.target.value)} /></label>
            <button className="btn" type="submit">Submit</button>
          </form>
          {msg && <div className="success">{msg}</div>}
          {error && <div className="error">{error}</div>}
        </section>

        <section className="card">
          <h3>Your Leave Requests</h3>
          <table className="leave-table">
  <thead>
    <tr>
      <th>From</th>
      <th>To</th>
      <th>Reason</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {leaveRequests.map(lr => (
      <tr key={lr._id}>
        <td>{new Date(lr.fromDate).toLocaleDateString()}</td>
        <td>{new Date(lr.toDate).toLocaleDateString()}</td>
        <td>{lr.reason}</td>
        <td>
          <span className={`status-badge status-${lr.status.toLowerCase()}`}>
            {lr.status}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>

        </section>
      </main>
    </>
  );
}
