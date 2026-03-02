"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ---------------- TYPES ---------------- */

type College = {
  id: string;
  name: string;
  abbreviation: string;
  code: string;
  institution_type?: string;
  website_url?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

type Contact = {
  name: string;
  designation?: string;
  college_email: string;
  personal_email?: string;
};

type User = {
  role_id: number;
};

/* ---------------- CONSTANTS ---------------- */

const INSTITUTION_TYPES = ["School", "College", "University"] as const;
type InstitutionType = (typeof INSTITUTION_TYPES)[number];

/* ---------------- COMPONENT ---------------- */

export default function CollegeProfile() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [college, setCollege] = useState<College | null>(null);
  const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);

  const [form, setForm] = useState<College | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Current user
        const meRes = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me: User = await meRes.json();
        setIsAdmin(me.role_id === 4);

        // College
        const collegeRes = await fetch("http://localhost:8000/api/v1/colleges");
        const colleges = await collegeRes.json();
        const currentCollege = colleges.find((c: College) => c.id === collegeId);

        setCollege(currentCollege);
        setForm(currentCollege);

        // Primary contact
        const contactRes = await fetch(
          `http://localhost:8000/api/v1/contacts/${collegeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const contacts = await contactRes.json();
        setPrimaryContact(contacts.find((c: any) => c.is_primary) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collegeId, token]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form) return;

    const res = await fetch(
      `http://localhost:8000/api/v1/colleges/${collegeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) {
      alert("Failed to update college profile");
      return;
    }

    setCollege(form);
    setEditMode(false);
  };

  /* ---------------- STATES ---------------- */

  if (loading) return <p className="text-muted">Loading college profile…</p>;
  if (!college || !form) return <p className="text-danger">College not found</p>;

  /* ---------------- UI ---------------- */

  return (
    <div className="d-flex flex-column gap-4">

      {/* ACTIONS */}
      {isAdmin && (
        <div className="d-flex justify-content-end gap-2">
          {!editMode ? (
            <button
              className="btn btn-outline-primary"
              onClick={() => setEditMode(true)}
            >
              ✏️ Edit
            </button>
          ) : (
            <>
              <button className="btn btn-success" onClick={handleSave}>
                💾 Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setForm(college);
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* INSTITUTION DETAILS */}
      <Section title="Institution Details" subtitle="Basic Information about your educational institution">
        <TwoColInput
          label1="Institution Name"
          name1="name"
          value1={form.name}
          label2="Abbreviation"
          name2="abbreviation"
          value2={form.abbreviation}
          onChange={handleChange}
          disabled={!editMode}
        />

        {/* Institution Type Dropdown */}
        <div className="mb-3">
          <label className="form-label">Institution Type</label>
          <select
            className="form-select"
            name="institution_type"
            value={form.institution_type || ""}
            onChange={handleChange}
            disabled={!editMode}
          >
            <option value="">Select type</option>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <OneCol label="Institution Code" value={form.code} disabled />
        <OneCol
          label="Website"
          name="website_url"
          value={form.website_url || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </Section>

      {/* PRIMARY CONTACT */}
      <Section title="Primary Contact" subtitle="Main point of contact for your institution">
        <TwoColStatic
          label1="Name"
          value1={primaryContact?.name || "—"}
          label2="Designation"
          value2={primaryContact?.designation || "—"}
        />
        <TwoColStatic
          label1="College Email"
          value1={primaryContact?.college_email || "—"}
          label2="Alternate Email"
          value2={primaryContact?.personal_email || "—"}
        />
      </Section>

      {/* ADDRESS */}
      <Section title="Address" subtitle="Complete address and location details">
        <OneCol
          label="Street Address"
          name="street_address"
          value={form.street_address || ""}
          onChange={handleChange}
          disabled={!editMode}
        />

        <TwoColInput
          label1="City"
          name1="city"
          value1={form.city || ""}
          label2="State"
          name2="state"
          value2={form.state || ""}
          onChange={handleChange}
          disabled={!editMode}
        />

        <TwoColInput
          label1="Postal Code"
          name1="postal_code"
          value1={form.postal_code || ""}
          label2="Country"
          name2="country"
          value2={form.country || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </Section>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Section({ title, subtitle, children }: any) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold">{title}</h5>
        <p className="text-muted small mb-3">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function OneCol({ label, value, name, onChange, disabled = true }: any) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function TwoColInput({
  label1,
  value1,
  name1,
  label2,
  value2,
  name2,
  onChange,
  disabled,
}: any) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6">
        <label className="form-label">{label1}</label>
        <input
          className="form-control"
          name={name1}
          value={value1}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">{label2}</label>
        <input
          className="form-control"
          name={name2}
          value={value2}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function TwoColStatic({ label1, value1, label2, value2 }: any) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6">
        <label className="form-label">{label1}</label>
        <input className="form-control" value={value1} disabled />
      </div>
      <div className="col-md-6">
        <label className="form-label">{label2}</label>
        <input className="form-control" value={value2} disabled />
      </div>
    </div>
  );
}
