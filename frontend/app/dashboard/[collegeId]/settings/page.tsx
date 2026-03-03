"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CollegeProfile from "./tabs/CollegeProfile";
import MyProfile from "./tabs/MyProfile";
import UserManagement from "./tabs/UserManagement";
import Security from "./tabs/Security";
import SystemPreferences from "./tabs/SystemPreferences";

/* ---------------- TYPES ---------------- */

type User = {
  id: string;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type Tab =
  | "college"
  | "profile"
  | "users"
  | "security"
  | "system";

/* ---------------- PAGE ---------------- */

export default function SettingsPage() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [activeTab, setActiveTab] = useState<Tab>("college");
  const [user, setUser] = useState<User | null>(null);

  /* ---------------- FETCH CURRENT USER ---------------- */

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role_id === 4;

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <h2 className="display-6 fw-bold">Settings</h2>

      <p className="text-muted">Manage your Institution profile, configuration, and preferences</p>

      {/* TABS */}
      <ul className="nav nav-pills flex-wrap gap-2 mb-4">
        <TabButton
          icon="bi-building"
          label="College Profile"
          active={activeTab === "college"}
          onClick={() => setActiveTab("college")}
        />

        <TabButton
          icon="bi-person"
          label="My Profile"
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        />

        {isAdmin && (
          <TabButton
            icon="bi-people"
            label="User Management"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
        )}

        <TabButton
          icon="bi-shield-lock"
          label="Security"
          active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
        />

        {isAdmin && (
          <TabButton
            icon="bi-sliders"
            label="System Preferences"
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
          />
        )}
      </ul>

      {/* CONTENT */}
      <div className="card shadow-sm">
        <div className="card-body">

          {activeTab === "college" && <CollegeProfile />}

          {activeTab === "profile" && <MyProfile />}

          {activeTab === "users" && isAdmin && <UserManagement />}


          {activeTab === "security" && (
            <Security />
          )}

          {activeTab === "system" && isAdmin && <SystemPreferences />}

        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li className="nav-item">
      <button
        className={`nav-link d-flex align-items-center gap-2 ${
          active ? "active" : ""
        }`}
        onClick={onClick}
      >
        <i className={`bi ${icon}`}></i>
        <span className="d-none d-sm-inline">{label}</span>
      </button>
    </li>
  );
}

function Placeholder({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} fs-1 text-muted mb-3`}></i>
      <h4 className="fw-bold">{title}</h4>
      <p className="text-muted">{text}</p>
    </div>
  );
}
