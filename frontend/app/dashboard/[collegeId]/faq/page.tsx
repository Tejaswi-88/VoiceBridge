"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FAQ = {
  id: string;
  category: string;
  language: string;
  question: string;
  answer: string;
};

export default function FAQPage() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [category, setCategory] = useState("ADMISSIONS");
  const [language, setLanguage] = useState("ENGLISH");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const categories = [
    "ADMIN", "FEE_SCHOLARSHIP", "TIMETABLE", "EXAM_RESULTS", "COURSE_INFO",
    "ADMISSIONS", "HOSTEL_HOUSING", "EVENTS_ACTIVITIES", "PLACEMENTS_CAREERS",
    "LIBRARY_SERVICES", "TECH_SUPPORT", "TRANSPORT", "HEALTH_WELLNESS",
    "ALUMNI_RELATIONS", "LANGUAGE_SUPPORT", "OTHER",
  ].sort();

  const languages = ["ENGLISH", "HINDI", "TELUGU", "TAMIL", "MARATHI"];

  const fetchFaqs = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/faqs/${collegeId}`);
    const data = await res.json();
    setFaqs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!collegeId) return;

    // Fetch FAQs
    fetchFaqs();

    // Fetch current user role
    fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(user => setIsAdmin(user.role_id === 4))
      .catch(() => setIsAdmin(false));
  }, [collegeId]);


  const resetForm = () => {
    setCategory("ADMISSIONS");
    setLanguage("ENGLISH");
    setQuestion("");
    setAnswer("");
    setEditId(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim())
      return alert("All fields required");
    setLoading(true);

    const url = editId
      ? `http://localhost:8000/api/v1/faqs/${editId}`
      : "http://localhost:8000/api/v1/faqs";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        college_id: collegeId,
        category,
        language,
        question,
        answer,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      console.log(await res.text());
      return alert("Error saving FAQ");
    }

    resetForm();
    setShowAdd(false);
    fetchFaqs();
  };

  const handleEdit = (faq: FAQ) => {
    setCategory(faq.category);
    setLanguage(faq.language);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditId(faq.id);
    setIsEditing(true);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;

    await fetch(`http://localhost:8000/api/v1/faqs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchFaqs();
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      (categoryFilter === "ALL" || f.category === categoryFilter) &&
      f.question.toLowerCase().includes(search.toLowerCase())
  );

  // KPIs
  const totalFaqs = faqs.length;

  const totalLanguages = new Set(
    faqs.map((f) => f.language)
  ).size;

  // Placeholder until chat analytics is implemented
  const totalUsage = "—";

  return (
    
        <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="display-5 fw-bold">FAQ Management</h2>
            {isAdmin && (
              <button
                className="btn btn-success"
                onClick={() => {
                  if (showAdd) resetForm();
                  setShowAdd(!showAdd);
                }}
              >
                {showAdd ? "Close" : "+ Add FAQ"}
              </button>
            )}
        </div>

        <p className="text-muted">Manage FAQs for your college</p>

        {/* Search + filter */}
        <div className="d-flex gap-2 mb-3">
            <input
            type="text"
            placeholder="Search FAQs..."
            className="form-control"
            onChange={(e) => setSearch(e.target.value)}
            />
            <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
                <option key={c} value={c}>
                {c}
                </option>
            ))}
            </select>
        </div>

        {/* Add/Edit Form */}
        {showAdd && (
            <div className="card p-3 mb-4 shadow-sm">
            <h5>{isEditing ? "Edit FAQ" : "Add New FAQ"}</h5>

            <div className="d-flex gap-2 my-2">
                <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                >
                {categories.map((c) => (
                    <option key={c} value={c}>
                    {c}
                    </option>
                ))}
                </select>

                <select
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                >
                {languages.map((l) => (
                    <option key={l} value={l}>
                    {l}
                    </option>
                ))}
                </select>
            </div>

            <input
                type="text"
                placeholder="Enter the question..."
                className="form-control mb-2"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />

            <textarea
                placeholder="Enter the answer..."
                rows={3}
                className="form-control mb-3"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
            />

            <div className="d-flex gap-2">
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
                    setShowAdd(false);
                    }}
                >
                    Cancel
                </button>
                </div>

            </div>
        )}

        {/* FAQ List */}
        {filteredFaqs.map((faq) => (
            <div className="card mb-2 shadow-sm" key={faq.id}>
            <div className="card-body">
                <div className="d-flex justify-content-between">
                <span className="badge bg-secondary">{faq.category}</span>
                <div>
                    {isAdmin && (
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(faq)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(faq.id)}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                </div>
                </div>
                <h5 className="mt-2">{faq.question}</h5>
                <p>{faq.answer}</p>
            </div>
            </div>
        ))}

        {!filteredFaqs.length && (
            <p className="text-muted text-center mt-3">
            No FAQs found.
            </p>
        )}


        {/* KPI SECTION */}
        <div className="row mt-5 g-3">
          <div className="col-md-4">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h2 className="fw-bold text-primary">{totalFaqs}</h2>
                <h6 className="text-muted">Total FAQs</h6>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h2 className="fw-bold text-success">{totalLanguages}</h2>
                <h6 className="text-muted">Languages</h6>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h2 className="fw-bold text-secondary">{totalUsage}</h2>
                <h6 className="text-muted">Total Usage</h6>
              </div>
            </div>
          </div>
        </div>

        </div>

  );
}
