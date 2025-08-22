// import React, { useEffect, useState } from 'react';
// import Navbar from '../components/Navbar';
// import api from '../services/axiosInstance';
// import './AdminDashboard.css';


// export default function AdminDashboard() {
//   const [employees, setEmployees] = useState([]);
//   const [leaves, setLeaves] = useState([]);
//   const [search, setSearch] = useState('');

//   // Add Employee state
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newEmployee, setNewEmployee] = useState({
//     empId: '', name: '', email: '', role: 'employee', mobile: '', photo: ''
//   });

//   // Edit Employee state
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editEmpId, setEditEmpId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     name: '', email: '', role: 'employee', mobile: '', photo: ''
//   });

//   const load = async () => {
//     const [eRes, lRes] = await Promise.all([
//       api.get('/admin/employees'),
//       api.get('/admin/leave-requests'),
//     ]);
//     setEmployees(eRes.data || []);
//     setLeaves(lRes.data || []);
//   };

//   useEffect(() => { load(); }, []);

//   // Leave status update
//   const updateLeave = async (id, status) => {
//     await api.put('/admin/leave-request', { leaveRequestId: id, status });
//     await load();
//   };

//   // Add employee
//   const handleAddEmployee = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/admin/employees', newEmployee);
//       setShowAddForm(false);
//       setNewEmployee({ empId: '', name: '', email: '', role: 'employee', mobile: '', photo: '' });
//       await load();
//     } catch (error) {
//       alert(error.response?.data?.message || 'Error adding employee');
//     }
//   };

//   // Edit employee
//   // Edit employee
// const handleEditEmployee = async (e) => {
//   e.preventDefault();
//   try {
//     await api.put(`/admin/employees/${editEmpId}`, editForm);
//     setShowEditForm(false);
//     setEditEmpId(null);
//     await load();
//   } catch (error) {
//     alert(error.response?.data?.message || 'Error updating employee');
//   }
// };

//   // Convert uploaded image to Base64
//   const toBase64 = (file, cb) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => cb(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const filtered = employees.filter(e =>
//     e.name?.toLowerCase().includes(search.toLowerCase()) ||
//     e.empId?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <>
//       <Navbar />
//       <main className="container">
//         {/* EMPLOYEE LIST */}
//         <section className="card">
//           <div className="row between">
//             <h2>Admin – Employees</h2>
//             <div style={{ display: 'flex', gap: '8px' }}>
//               <input
//                 placeholder="Search name or empId"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//               <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>Add Employee</button>
//             </div>
//           </div>

//           <table className="table">
//             <thead>
//               <tr>
//                 <th>EmpID</th><th>Name</th><th>Mobile</th><th>Role</th><th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(emp => (
//                 <tr key={emp._id}>
//                   <td>{emp.empId}</td>
//                   <td>{emp.name}</td>
//                   <td>{emp.mobile}</td>
//                   <td>{emp.role}</td>
//                   <td className="actions">
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => {
//                         setEditEmpId(emp.empId);
//                         setEditForm({
//                           name: emp.name || '',
//                           email: emp.email || '',
//                           role: emp.role || 'employee',
//                           mobile: emp.mobile || '',
//                           photo: emp.photo || ''
//                         });
//                         setShowEditForm(true);
//                       }}
//                     >Edit</button>
//                     <button
//                       className="btn btn-danger"
//                       onClick={async () => {
//                         if (!window.confirm(`Delete ${emp.name}?`)) return;
//                         await api.delete(`/admin/employees/${emp.empId}`);
//                         await load();
//                       }}
//                     >Delete</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>

//         {/* LEAVE REQUESTS */}
//         <section className="card">
//           <h2>Admin – Leave Requests</h2>
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>EmpID</th><th>Name</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leaves.map(l => (
//                 <tr key={l._id}>
//                   <td>{l.employeeId?.empId}</td>
//                   <td>{l.employeeId?.name}</td>
//                   <td>{new Date(l.fromDate).toLocaleDateString()}</td>
//                   <td>{new Date(l.toDate).toLocaleDateString()}</td>
//                   <td>{l.reason}</td>
//                   <td>{l.status}</td>
//                   <td className="actions">
//                     {l.status === 'Pending' && (
//                       <>
//                         <button className="btn" onClick={() => updateLeave(l._id, 'Approved')}>Approve</button>
//                         <button className="btn btn-danger" onClick={() => updateLeave(l._id, 'Rejected')}>Reject</button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>
//       </main>

//       {/* ADD EMPLOYEE MODAL */}
//       {showAddForm && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3>Add Employee</h3>
//             <form onSubmit={handleAddEmployee}>
//               <input placeholder="Employee ID" value={newEmployee.empId} onChange={e => setNewEmployee({ ...newEmployee, empId: e.target.value })} required />
//               <input placeholder="Name" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
//               <input placeholder="Email" type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
//               <input placeholder="Mobile" value={newEmployee.mobile} onChange={e => setNewEmployee({ ...newEmployee, mobile: e.target.value })} required />
//               <select value={newEmployee.role} onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}>
//                 <option value="employee">Employee</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <input type="file" accept="image/*" onChange={(e) => toBase64(e.target.files[0], (base64) => setNewEmployee({ ...newEmployee, photo: base64 }))} required />
//               {newEmployee.photo && <img src={newEmployee.photo} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />}
//               <div className="row" style={{ marginTop: 10, gap: 8, justifyContent:'flex-end', }}>
//                 <button type="submit" className="btn btn-primary" style={{marginRight:60}}>Save</button>
//                 <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* EDIT EMPLOYEE MODAL */}
//       {showEditForm && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3>Edit Employee ({editEmpId})</h3>
//             <form onSubmit={handleEditEmployee}>
//               <input placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
//               <input placeholder="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
//               <input placeholder="Mobile" value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} required />
//               <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
//                 <option value="employee">Employee</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <input type="file" accept="image/*" onChange={(e) => toBase64(e.target.files[0], (base64) => setEditForm({ ...editForm, photo: base64 }))} />
//               {editForm.photo && <img src={editForm.photo} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />}
//               <div className="row" style={{ marginTop: 10, gap: 8 }}>
//                 <button type="submit" className="btn btn-primary">Update</button>
//                 <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }






















// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");

  // Add Employee state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    empId: "",
    name: "",
    email: "",
    role: "employee",
    mobile: "",
    photoFile: null, // 👈 store File instead of base64
  });
  const [newPreview, setNewPreview] = useState(null);

  // Edit Employee state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editEmpId, setEditEmpId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "employee",
    mobile: "",
    photoFile: null, // 👈 optional new File
  });
  const [editPreview, setEditPreview] = useState(null);

  const load = async () => {
    const [eRes, lRes] = await Promise.all([
      api.get("/admin/employees"),
      api.get("/admin/leave-requests"),
    ]);
    setEmployees(eRes.data || []);
    setLeaves(lRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateLeave = async (id, status) => {
    await api.put("/admin/leave-request", { leaveRequestId: id, status });
    await load();
  };

  /** ✅ Add employee as multipart/form-data */
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("empId", newEmployee.empId);
      fd.append("name", newEmployee.name);
      fd.append("email", newEmployee.email);
      fd.append("role", newEmployee.role);
      fd.append("mobile", newEmployee.mobile);
      if (newEmployee.photoFile) fd.append("photo", newEmployee.photoFile);

      await api.post("/admin/employees", fd); // axios sets content-type automatically
      setShowAddForm(false);
      setNewEmployee({
        empId: "",
        name: "",
        email: "",
        role: "employee",
        mobile: "",
        photoFile: null,
      });
      setNewPreview(null);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding employee");
    }
  };

  /** ✅ Edit employee as multipart/form-data (photo optional) */
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("email", editForm.email);
      fd.append("role", editForm.role);
      fd.append("mobile", editForm.mobile);
      if (editForm.photoFile) fd.append("photo", editForm.photoFile); // optional

      await api.put(`/admin/employees/${editEmpId}`, fd);
      setShowEditForm(false);
      setEditEmpId(null);
      setEditPreview(null);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating employee");
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.empId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="container">
        {/* EMPLOYEE LIST */}
        <section className="card">
          <div className="row between">
            <h2>Admin – Employees</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                placeholder="Search name or empId"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add Employee
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>EmpID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.empId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.mobile}</td>
                  <td>{emp.role}</td>
                  <td className="actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditEmpId(emp.empId);
                        setEditForm({
                          name: emp.name || "",
                          email: emp.email || "",
                          role: emp.role || "employee",
                          mobile: emp.mobile || "",
                          photoFile: null,
                        });
                        setEditPreview(null);
                        setShowEditForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${emp.name}?`)) return;
                        await api.delete(`/admin/employees/${emp.empId}`);
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* LEAVE REQUESTS */}
        <section className="card">
          <h2>Admin – Leave Requests</h2>
          <table className="table">
            <thead>
              <tr>
                <th>EmpID</th>
                <th>Name</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>{l.employeeId?.empId}</td>
                  <td>{l.employeeId?.name}</td>
                  <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(l.toDate).toLocaleDateString()}</td>
                  <td>{l.reason}</td>
                  <td>{l.status}</td>
                  <td className="actions">
                    {l.status === "Pending" && (
                      <>
                        <button
                          className="btn"
                          onClick={() => updateLeave(l._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => updateLeave(l._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* ADD EMPLOYEE MODAL */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <input
                placeholder="Employee ID"
                value={newEmployee.empId}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, empId: e.target.value })
                }
                required
              />
              <input
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                required
              />
              <input
                placeholder="Mobile"
                value={newEmployee.mobile}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, mobile: e.target.value })
                }
                required
              />
              <select
                value={newEmployee.role}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewEmployee({ ...newEmployee, photoFile: file });
                  setNewPreview(file ? URL.createObjectURL(file) : null);
                }}
                required
              />
              {newPreview && (
                <img
                  src={newPreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}

              <div
                className="row"
                style={{ marginTop: 10, gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginRight: 60 }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Employee ({editEmpId})</h3>
            <form onSubmit={handleEditEmployee}>
              <input
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
              />
              <input
                placeholder="Mobile"
                value={editForm.mobile}
                onChange={(e) =>
                  setEditForm({ ...editForm, mobile: e.target.value })
                }
                required
              />
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditForm({ ...editForm, photoFile: file });
                  setEditPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {editPreview && (
                <img
                  src={editPreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}

              <div className="row" style={{ marginTop: 10, gap: 8 }}>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}









