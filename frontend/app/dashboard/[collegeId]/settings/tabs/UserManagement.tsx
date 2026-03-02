"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ================= TYPES ================= */

type User = {
  id: string;
  username: string;
  email: string;

  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;

  role: {
    id: number;
    name: string;
  };

  is_active: boolean;
  created_at: string;

  temp_password?: string; // only returned on create/reset
};

/* ================= CONSTANTS ================= */

const ROLES = [
  { id: 1, name: "STUDENT" },
  { id: 2, name: "FAMILY" },
  { id: 3, name: "FACULTY" },
  { id: 4, name: "ADMIN" },
  { id: 5, name: "VOLUNTEER" },
];

/* ================= COMPONENT ================= */

export default function UserManagement() {

  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showAdd, setShowAdd] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "OTHER",
    role_id: 1,
    username: "",
    email: "",
    password: "",
  });

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8000/api/v1/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTER LOGIC ================= */

  useEffect(() => {
    let data = [...users];

    if (search.trim()) {
      data = data.filter(
        (u) =>
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      data = data.filter((u) => u.role.name === roleFilter);
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (u) => (statusFilter === "ACTIVE" ? u.is_active : !u.is_active)
      );
    }

    setFiltered(data);
  }, [search, roleFilter, statusFilter, users]);

  /* ================= HANDLERS ================= */

  const handleAddUser = async () => {
    const res = await fetch("http://localhost:8000/api/v1/admin/users", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        ...form,
        college_id: collegeId,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to create user");
        return;
    }

    setShowAdd(false);
    setForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "OTHER",
        role_id: 1,
        username: "",
        email: "",
        password: "",
    });

    fetchUsers();
    };


  /* ================= UI ================= */

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">User Management</h2>
        <button className="btn btn-success" onClick={() => setShowAdd(true)}>
          + Add User
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search name / username / email"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* ================= USER TABLE ================= */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.first_name} {u.middle_name} {u.last_name}
                  </td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {u.role.name}
                    </span>
                  </td>
                  <td>
                    {u.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </td>

                  {/* PASSWORD VISIBILITY */}
                  <td>
                    {u.temp_password ? (
                      <>
                        {showPassword === u.id
                          ? u.temp_password
                          : "••••••"}
                        <button
                          className="btn btn-sm btn-link"
                          onClick={() =>
                            setShowPassword(
                              showPassword === u.id ? null : u.id
                            )
                          }
                        >
                          👁
                        </button>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      ✏️
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD USER MODAL ================= */}
      {showAdd && (
        <div className="modal fade show d-block" style={{ background: "#00000066" }}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>Add New User</h5>
                <button className="btn-close" onClick={() => setShowAdd(false)} />
              </div>

              <div className="modal-body">
                <input className="form-control mb-2" placeholder="First Name"
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })} />

                <input className="form-control mb-2" placeholder="Middle Name"
                  onChange={(e) => setForm({ ...form, middle_name: e.target.value })} />

                <input className="form-control mb-2" placeholder="Last Name"
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })} />

                <select className="form-select mb-2"
                  onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}>
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>

                <input className="form-control mb-2" placeholder="Username"
                  onChange={(e) => setForm({ ...form, username: e.target.value })} />

                <input className="form-control mb-2" placeholder="Email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />

                <input className="form-control" placeholder="Temporary Password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleAddUser}>
                  Create User
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
