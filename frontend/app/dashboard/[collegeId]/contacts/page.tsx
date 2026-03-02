"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Contact = {
  id: string;
  name: string;
  category: string;
  college_email: string;
  phone_number: string;
  personal_email?: string;
  designation?: string;
  office_location?: string;
  availability?: string;
  is_primary: boolean;
};

type User = {
  role_id: number;
};

const CATEGORY_OPTIONS = [
  "ADMISSION_OFFICE",
  "SCHOLARSHIP_FINANCIAL_AID",
  "FINANCE_ACCOUNTS",
  "EXAMINATION_CELL",
  "ACADEMIC_OFFICE",
  "HOSTEL_WARDEN",
  "LIBRARY_SERVICES",
  "PLACEMENT_CAREER_SERVICES",
  "STUDENT_WELFARE_COUNSELING",
  "IT_TECHNICAL_SUPPORT",
  "TRANSPORT_OFFICE",
  "GENERAL_ADMINISTRATION",
].sort();

/* ---------------- COMPONENT ---------------- */

export default function ContactManagementPage() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "ADMISSION_OFFICE",
    college_email: "",
    phone_number: "",
    personal_email: "",
    designation: "",
    office_location: "",
    availability: "",
  });

  /* ---------------- FETCH ---------------- */

  const fetchContacts = async () => {
    const res = await fetch(
      `http://localhost:8000/api/v1/contacts/${collegeId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
  };

  const fetchMe = async () => {
    const res = await fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me: User = await res.json();
    setIsAdmin(me.role_id === 4);
  };

  useEffect(() => {
    fetchContacts();
    fetchMe();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const resetForm = () => {
    setForm({
      name: "",
      category: "ADMISSION_OFFICE",
      college_email: "",
      phone_number: "",
      personal_email: "",
      designation: "",
      office_location: "",
      availability: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!form.name || !form.college_email || !form.phone_number) {
      return alert("Name, College Email, and Phone are required");
    }

    setLoading(true);

    const url = editId
      ? `http://localhost:8000/api/v1/contacts/${editId}`
      : "http://localhost:8000/api/v1/contacts";

    const method = editId ? "PUT" : "POST";

    const cleanedPayload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
    );

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...cleanedPayload,
        college_id: collegeId,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      console.error(await res.text());
      return alert("Failed to save contact");
    }

    resetForm();
    setShowForm(false);
    fetchContacts();
  };

  /* ---------------- PRIMARY CONTACT ---------------- */

  const makePrimary = async (contactId: string) => {
    if (!confirm("Set this contact as Primary Contact?")) return;

    const res = await fetch(
      `http://localhost:8000/api/v1/contacts/${contactId}/set-primary`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      alert("Failed to update primary contact");
      return;
    }

    fetchContacts();
  };

  /* ---------------- EDIT / DELETE ---------------- */

  const handleEdit = (c: Contact) => {
    setForm({
      name: c.name,
      category: c.category,
      college_email: c.college_email,
      phone_number: c.phone_number,
      personal_email: c.personal_email || "",
      designation: c.designation || "",
      office_location: c.office_location || "",
      availability: c.availability || "",
    });
    setEditId(c.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (c: Contact) => {
    if (c.is_primary) {
      alert("Primary contact cannot be deleted");
      return;
    }

    if (!confirm("Delete this contact?")) return;

    await fetch(`http://localhost:8000/api/v1/contacts/${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchContacts();
  };

  /* ---------------- FILTER + KPIs ---------------- */

  const filteredContacts = contacts.filter((c) =>
    `${c.name} ${c.college_email} ${c.phone_number}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalContacts = contacts.length;
  const alternateEmails = contacts.filter(
    (c) => c.personal_email && c.personal_email.trim() !== ""
  ).length;

  /* ---------------- UI ---------------- */

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="display-6 fw-bold">Contact Management</h2>
        {isAdmin && (
          <button
            className="btn btn-success"
            onClick={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close" : "+ Add New Contact"}
          </button>
        )}

      </div>

      <p className="text-muted">Manage Institution Contacts</p>

      <input
        className="form-control mb-3"
        placeholder="Search contacts..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="mb-3">
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </h5>

          <div className="row g-2">
            <div className="col-md-6">
              <input
                name="name"
                className="form-control"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <select
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <input
                name="college_email"
                className="form-control"
                placeholder="College Email"
                value={form.college_email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="phone_number"
                className="form-control"
                placeholder="Phone Number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="personal_email"
                className="form-control"
                placeholder="Personal Email (optional)"
                value={form.personal_email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="designation"
                className="form-control"
                placeholder="Designation"
                value={form.designation}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="office_location"
                className="form-control"
                placeholder="Office Location"
                value={form.office_location}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="availability"
                className="form-control"
                placeholder="Availability"
                value={form.availability}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-success flex-fill"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Save"}
            </button>

            <button
              className="btn btn-secondary flex-fill"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* CONTACT ROWS */}
      {filteredContacts.map((c) => (
        <div className="card mb-2" key={c.id}>
          <div className="card-body">
            <div className="row align-items-center">

              <div className="col-md-3">
                <div className="fw-bold">
                  {c.name}
                  {c.is_primary && (
                    <span className="badge bg-success ms-2">Primary</span>
                  )}
                </div>
                <small className="text-muted">
                  {c.category.replaceAll("_", " ")}
                </small>
              </div>

              <div className="col-md-4">
                <div>{c.college_email}</div>
                <div className="text-muted small">{c.phone_number}</div>
                {c.personal_email && (
                  <div className="text-muted small">{c.personal_email}</div>
                )}
              </div>

              <div className="col-md-3 text-muted small">
                <div>{c.designation || "—"}</div>
                <div>{c.office_location || "—"}</div>
                <div>{c.availability || "—"}</div>
              </div>

              <div className="col-md-2 text-end d-flex justify-content-end gap-2">
                {isAdmin && !c.is_primary && (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => makePrimary(c.id)}
                  >
                    ⭐
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(c)}
                    >
                      ✏️
                    </button>

                    {!c.is_primary && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c)}
                      >
                        🗑
                      </button>
                    )}
                  </>
                )}

              </div>

            </div>
          </div>
        </div>
      ))}

      {/* KPIs */}
      <div className="row mt-5 g-3">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h3>{totalContacts}</h3>
            <small>Total Contacts</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h3>{alternateEmails}</h3>
            <small>With Alternative Emails</small>
          </div>
        </div>
      </div>
    </div>
  );
}
