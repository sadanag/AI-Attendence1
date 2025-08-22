// // src/pages/AdminAttendance.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Navbar from "../components/Navbar";
// import api from "../services/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { msToHMS } from "../utils/time";

// function rangeFromFilter(filter) {
//   const now = new Date();
//   let from;
//   if (filter === "weekly") {
//     const day = now.getDay();
//     const diff = day === 0 ? 6 : day - 1; // Monday start
//     from = new Date(now);
//     from.setDate(now.getDate() - diff);
//   } else if (filter === "monthly") {
//     from = new Date(now.getFullYear(), now.getMonth(), 1);
//   } else if (filter === "yearly") {
//     from = new Date(now.getFullYear(), 0, 1);
//   } else {
//     from = new Date(0);
//   }
//   return { from: from.toISOString(), to: now.toISOString() };
// }

// export default function AdminAttendance() {
//   const { user } = useAuth();
//   const [filter, setFilter] = useState("weekly");
//   const [empId, setEmpId] = useState(""); // optional filter
//   const [rows, setRows] = useState([]);

//   useEffect(() => {
//     if (user?.role !== "admin") return;
//     const load = async () => {
//       const { from, to } = rangeFromFilter(filter);
//       const res = await api.get("/admin/attendance", {
//         params: { from, to, empId: empId || undefined },
//       });
//       setRows(res.data || []);
//     };
//     load();
//   }, [filter, empId, user?.role]);

//   const totalMs = useMemo(() => {
//     return (rows || []).reduce((acc, r) => {
//       if (r.checkInTime && r.checkOutTime) {
//         acc += Math.max(0, new Date(r.checkOutTime) - new Date(r.checkInTime));
//       }
//       return acc;
//     }, 0);
//   }, [rows]);

//   if (user?.role !== "admin") {
//     return (
//       <>
//         <Navbar />
//         <main className="container">
//           <section className="card"><h2>Forbidden</h2></section>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="container">
//         <section className="card">
//           <div className="row between">
//             <h2>All Employees — Attendance</h2>
//             <div className="row gap">
//               <input
//                 placeholder="Filter by Emp ID (optional)"
//                 value={empId}
//                 onChange={(e) => setEmpId(e.target.value)}
//                 style={{ padding: 8 }}
//               />
//               <select value={filter} onChange={(e) => setFilter(e.target.value)}>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//                 <option value="all">All</option>
//               </select>
//             </div>
//           </div>

//           <table className="table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Emp ID</th>
//                 <th>Name</th>
//                 <th>Check-In</th>
//                 <th>Check-Out</th>
//                 <th>Worked</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((r, i) => {
//                 const worked = (r.checkInTime && r.checkOutTime)
//                   ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
//                   : "-";
//                 return (
//                   <tr key={r._id || i}>
//                     <td>{i + 1}</td>
//                     <td>{r.employee?.empId}</td>
//                     <td>{r.employee?.name}</td>
//                     <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "-"}</td>
//                     <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "-"}</td>
//                     <td>{worked}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           <div className="total">
//             Total Worked (filtered): <strong>{msToHMS(totalMs)}</strong>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }









import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { msToHMS } from "../utils/time";

function rangeFromFilter(filter) {
  const now = new Date();
  let from;
  if (filter === "weekly") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday start
    from = new Date(now);
    from.setDate(now.getDate() - diff);
  } else if (filter === "monthly") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === "yearly") {
    from = new Date(now.getFullYear(), 0, 1);
  } else {
    from = new Date(0);
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

export default function AdminAttendance() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("weekly");
  const [empId, setEmpId] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const load = async () => {
      const { from, to } = rangeFromFilter(filter);
      const res = await api.get("/admin/attendance", {
        params: { from, to, empId: empId || undefined },
      });
      setRows(res.data || []);
    };
    load();
  }, [filter, empId, user?.role]);

  const totalMs = useMemo(() => {
    return (rows || []).reduce((acc, r) => {
      if (r.checkInTime && r.checkOutTime) {
        acc += Math.max(
          0,
          new Date(r.checkOutTime) - new Date(r.checkInTime)
        );
      }
      return acc;
    }, 0);
  }, [rows]);

  if (user?.role !== "admin") {
    return (
      <>
        <Navbar />
        <main className="container">
          <section className="card">
            <h2>Forbidden</h2>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="card">
          <div className="row between">
            <h2>All Employees — Attendance</h2>
            <div className="row gap">
              <input
                placeholder="Filter by Emp ID (optional)"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                style={{ padding: 8 }}
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Check-In</th>
                <th>Check-In Photo</th>
                <th>Check-Out</th>
                <th>Check-Out Photo</th>
                <th>Worked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const worked =
                  r.checkInTime && r.checkOutTime
                    ? msToHMS(
                        new Date(r.checkOutTime) - new Date(r.checkInTime)
                      )
                    : "-";
                return (
                  <tr key={r._id || i}>
                    <td>{i + 1}</td>
                    <td>{r.employee?.empId}</td>
                    <td>{r.employee?.name}</td>
                    <td>
                      {r.checkInTime
                        ? new Date(r.checkInTime).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {r.checkInPhoto && (
                        <img
                          src={`${
                            import.meta.env.VITE_API_URL
                          }/file/${r.checkInPhoto}`}
                          alt="Check-In"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {r.checkOutTime
                        ? new Date(r.checkOutTime).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {r.checkOutPhoto && (
                        <img
                          src={`${
                            import.meta.env.VITE_API_URL
                          }/file/${r.checkOutPhoto}`}
                          alt="Check-Out"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </td>
                    <td>{worked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="total">
            Total Worked (filtered): <strong>{msToHMS(totalMs)}</strong>
          </div>
        </section>
      </main>
    </>
  );
}
