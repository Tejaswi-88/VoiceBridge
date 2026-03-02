"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type College = {
  id: string;
  name: string;
  code: string;
};

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

export default function SignupPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [positions, setPositions] = useState<IconPosition[]>([]);
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "OTHER",
    email: "",
    password: "",
    college_id: "",
    role_id: 1,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/colleges")
      .then((res) => res.json())
      .then(setColleges)
      .catch(() => alert("Failed to load colleges"));

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role_id: Number(form.role_id) }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.detail || "Registration failed");
      return;
    }

    router.push("/?registered=true");
  };

  return (
    <div className="container-fluid signup-wrapper global1-bg-dark">

      {/* 🌌 FLOATING ICONS — FULL PAGE */}
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

      {/* CONTENT */}
      <div className="row min-vh-100 position-relative content-layer">

        {/* LEFT */}
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
              Hi there 👋 <br />
              I’m your smart assistant.<br />
              Ready to sign up?
            </div>
          </div>
        </div>

        {/* RIGHT */}
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

            <h3 className="h2-color text-center mb-4">Create Account</h3>

            <label className="form-label">Username:</label>
            <input className="form-control mb-3" name="username" placeholder="Username" onChange={handleChange} required />
            <label className="form-label">First Name:</label>
            <input className="form-control mb-3" name="first_name" placeholder="First Name" onChange={handleChange} required />
            <label className="form-label">Middle Name:</label>
            <input className="form-control mb-3" name="middle_name" placeholder="Middle Name (optional)" onChange={handleChange} />
            <label className="form-label">Last Name:</label>
            <input className="form-control mb-3" name="last_name" placeholder="Last Name" onChange={handleChange} required />

            <label className="form-label">Gender:</label>
            <select className="form-select mb-3" name="gender" onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <label className="form-label">Email Address:</label>
            <input className="form-control mb-3" type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <label className="form-label">Password:</label>
            <input className="form-control mb-3" type="password" name="password" placeholder="Password" onChange={handleChange} required />

            <label className="form-label">College:</label>
            <select className="form-select mb-3" name="college_id" onChange={handleChange} required>
              <option value="">Select College</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="form-label">Register As:</label>
            <select className="form-select mb-4" name="role_id" onChange={handleChange}>
              <option value={1}>Student</option>
              <option value={2}>Family</option>
            </select>

            <button className="btn btn-success w-100">Register</button>

            <p className="text-center mt-3">
              Already registered? <Link href="/login" className="text-success fw-semibold">Login</Link>
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
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(var(--dx), var(--dy)) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        .content-layer {
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
