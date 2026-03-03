"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  role_id: number;
};

export default function Sidebar({ collegeId }: { collegeId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const [role, setRole] = useState<number | null>(null);

  // ================= FETCH USER ROLE =================
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const user: User = await res.json();
        setRole(user.role_id);
      } catch {
        console.error("Failed to fetch role");
      }
    };

    fetchMe();
  }, []);

  // ================= MENUS =================

  // Student / Family
  const baseMenu = [
    { name: "Chat", path: "chat", icon: "bi-chat-left-text" },
    { name: "Settings", path: "settings", icon: "bi-gear" },
  ];

  // Faculty
  const facultyMenu = [
    { name: "Chat", path: "chat", icon: "bi-chat-left-text" },
    { name: "Knowledge Base", path: "kb", icon: "bi-journal-text" },
    { name: "Settings", path: "settings", icon: "bi-gear" },
  ];

  // Admin / Volunteer
  const adminMenu = [
    { name: "Chat", path: "chat", icon: "bi-chat-left-text" }, // ✅ ADDED
    { name: "Analysis", path: "analysis", icon: "bi-graph-up" },
    { name: "Role Insights", path: "logs", icon: "bi-chat-dots" },
    { name: "Knowledge Base", path: "kb", icon: "bi-journal-text" },
    { name: "FAQ Management", path: "faq", icon: "bi-question-circle" },
    { name: "Contact Management", path: "contacts", icon: "bi-people" },
    { name: "Support Tickets", path: "tickets", icon: "bi-life-preserver" },
    { name: "Settings", path: "settings", icon: "bi-gear" },
  ];

  let menu = baseMenu;

  if (role === 3) menu = facultyMenu;
  if (role === 4 || role === 5) menu = adminMenu;

  // ================= LOGOUT =================

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("vb_token");
    router.push("/");
  };

  // ================= UI =================

  return (
    <aside className="sidebar d-flex flex-column bg-dark text-white p-3">
      
      {/* BRAND */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
          style={{ width: 45, height: 45 }}
        >
          <i className="bi bi-person fs-5"></i>
        </div>
        <div>
          <h5 className="fw-bold mb-0">
            <span className="brand-voice">Voice</span>
            <span className="brand-bridge">Bridge</span>
          </h5>
          <small className="text-light" style={{ fontSize: "0.75rem" }}>
            Dashboard
          </small>
        </div>
      </div>

      {/* MENU */}
      <nav className="nav flex-column flex-grow-1">
        {menu.map((item) => {
          const isActive = pathname.includes(item.path);

          return (
            <Link
              key={item.path}
              href={`/dashboard/${collegeId}/${item.path}`}
              className={`nav-link px-3 py-2 rounded mb-2 sidebar-link d-flex align-items-center gap-2 ${
                isActive ? "active-link" : ""
              }`}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="btn btn-outline-danger d-flex align-items-center gap-2 mt-3"
      >
        <i className="bi bi-box-arrow-right"></i>
        Logout
      </button>
    </aside>
  );
}
