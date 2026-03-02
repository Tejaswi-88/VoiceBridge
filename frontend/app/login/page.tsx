"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface IconPosition {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  dx: number;
  dy: number;
}

const icons = [
  "bi-translate",
  "bi-chat-dots",
  "bi-mic",
  "bi-cpu",
  "bi-robot",
  "bi-text-paragraph",
  "bi-journal-text",
  "bi-emoji-smile",
  "bi-globe",
  "bi-people",
  "bi-book",
  "bi-headset",
  "bi-pencil",
  "bi-lightbulb",
  "bi-cloud",
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [positions, setPositions] = useState<IconPosition[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* Floating icons */
  useEffect(() => {
    const generated = Array.from({ length: icons.length }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 18 + Math.random() * 22,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      dx: Math.random() * 160 - 80,
      dy: Math.random() * 160 - 80,
    }));
    setPositions(generated);
  }, []);

  /* Show success toast after signup redirect */
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setToast({
        type: "success",
        message: "Registration successful! Please log in.",
      });

      setTimeout(() => setToast(null), 4000);
    }
  }, [searchParams]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({
          type: "error",
          message: data.detail || "Invalid credentials",
        });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      /* Store auth */
      localStorage.setItem("vb_token", data.access_token);
      localStorage.setItem("vb_role", data.role_id);
      localStorage.setItem("vb_college", data.college_id);

      setToast({
        type: "success",
        message: "Login successful! Redirecting...",
      });

      // ✅ FIXED REDIRECT — ALL USERS GO TO DASHBOARD CHAT
      setTimeout(() => {
        router.push(`/dashboard/${data.college_id}/chat`);
      }, 1200);

    } catch {
      setToast({
        type: "error",
        message: "Something went wrong. Try again.",
      });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="container-fluid signup-wrapper global1-bg-dark">

      {/* 🔔 TOAST */}
      {toast && (
        <div
          className={`alert ${
            toast.type === "success" ? "alert-success" : "alert-danger"
          } shadow-lg`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            minWidth: "320px",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* 🌌 FLOATING ICONS */}
      {positions.map((pos, i) => (
        <i
          key={i}
          className={`floating-icon ${icons[i % icons.length]}`}
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            fontSize: `${pos.size}px`,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`,
            ["--dx" as any]: `${pos.dx}px`,
            ["--dy" as any]: `${pos.dy}px`,
          }}
        />
      ))}

      <div className="row min-vh-100 position-relative content-layer">

        {/* LEFT SIDE */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="chatbot-css">
            <div className="bot-head">
              <div className="visor">
                <span className="eye left-eye"></span>
                <span className="eye right-eye"></span>
              </div>
              <div className="antenna"></div>
            </div>

            <div className="bot-body">
              <div className="arm waving-arm"></div>
              <div className="arm static-arm"></div>
              <div className="chest"></div>
            </div>

            <div className="chat-bubble">
              Welcome back 👋 <br />
              Log in to continue.
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-6 d-flex align-items-center justify-content-center py-5">
          <form onSubmit={handleSubmit} className="signup-card w-75">

            <button
              type="button"
              className="btn btn-link p-0 mb-3"
              style={{ color: "#339989" }}
              onClick={() => router.push("/")}
            >
              ← Back
            </button>

            <h3 className="h2-color text-center mb-4">Login</h3>

            <label className="form-label">Username/Email:</label>
            <input
              className="form-control mb-3"
              name="identifier"
              placeholder="Email or Username"
              onChange={handleChange}
              required
            />

            <label className="form-label">Password:</label>
            <input
              className="form-control mb-4"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button className="btn btn-success w-100">Login</button>

            <p className="text-center mt-3">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-success fw-semibold">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* 🎨 STYLES */}
      <style jsx>{`
        .signup-wrapper {
          position: relative;
          overflow: hidden;
        }

        .floating-icon {
          position: absolute;
          z-index: 1;
          color: rgba(255, 255, 255, 0.28);
          pointer-events: none;
          animation-name: roam;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        @keyframes roam {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(var(--dx), var(--dy)) rotate(180deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }

        .content-layer {
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
