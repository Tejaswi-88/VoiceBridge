"use client";

import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type UserProfile = {
  id: string;
  username: string;
  email: string;

  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;

  role_id: number;
  college_id: string;

  is_active: boolean;
  created_at: string;

  role?: {
    id: number;
    name: string;
  };

  college?: {
    id: string;
    name: string;
    abbreviation: string;
    code: string;
  };
};

/* ---------------- COMPONENT ---------------- */

export default function MyProfile() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "OTHER",
    username: "",
    email: "",
  });

  const isAdminVolunteer =
    profile?.role_id === 4 || profile?.role_id === 5;

  /* ---------------- FETCH PROFILE ---------------- */

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        setProfile(data);
        setForm({
          first_name: data.first_name,
          middle_name: data.middle_name || "",
          last_name: data.last_name,
          gender: data.gender,
          username: data.username,
          email: data.email,
        });
      });
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    const payload: any = {
      first_name: form.first_name,
      middle_name: form.middle_name || null,
      last_name: form.last_name,
      gender: form.gender,
    };

    // Only Admin & Volunteer can edit identity fields
    if (isAdminVolunteer) {
      payload.username = form.username;
      payload.email = form.email;
    }

    const res = await fetch("http://localhost:8000/api/v1/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update profile");
      return;
    }

    const updated = await res.json();
    setProfile(updated);
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-person fs-1 mb-3"></i>
        <p>Unable to load profile</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid py-3">

      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Profile</h2>
        {!editing ? (
          <button
            className="btn btn-outline-primary"
            onClick={() => setEditing(true)}
          >
            <i className="bi bi-pencil"></i> Edit
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button
              className="btn btn-success"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ================= ACCOUNT IDENTITY ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Account Identity</h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                disabled={!editing || !isAdminVolunteer}
                onChange={handleChange}
              />
              {!isAdminVolunteer && (
                <small className="text-muted">
                  Only Admin & Volunteer can edit username
                </small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                name="email"
                value={form.email}
                disabled={!editing || !isAdminVolunteer}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= PERSONAL INFO ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Personal Information</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">First Name</label>
              <input
                className="form-control"
                name="first_name"
                value={form.first_name}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Middle Name</label>
              <input
                className="form-control"
                name="middle_name"
                value={form.middle_name}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Last Name</label>
              <input
                className="form-control"
                name="last_name"
                value={form.last_name}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={form.gender}
                disabled={!editing}
                onChange={handleChange}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACCOUNT DETAILS ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Account Details</h5>

          <p><strong>Role:</strong> {profile.role?.name ?? `Role ID: ${profile.role_id}`}</p>
          <p><strong>Status:</strong> {profile.is_active ? "Active" : "Inactive"}</p>
          <p className="text-muted mb-0">
            Joined on {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ================= COLLEGE ================= */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">College</h5>

          {profile.college ? (
            <>
              <strong>{profile.college.name}</strong>
              <br />
              <small className="text-muted">
                {profile.college.abbreviation} • {profile.college.code}
              </small>
            </>
          ) : (
            <span className="text-muted">College not assigned</span>
          )}
        </div>
      </div>

    </div>
  );
}
