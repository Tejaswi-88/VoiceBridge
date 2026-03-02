"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

/* =========================
   TYPES
========================= */

type Ticket = {
  id: string;
  category: string;
  user_language: string;
  original_query: string;
  normalized_query: string;
  status: "PENDING" | "SOLVED" | "IGNORED";
  created_at: string;
};

/* =========================
   COMPONENT
========================= */

export default function TicketsPage() {
  const { collegeId } = useParams();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("vb_token")
      : null;

  const base = process.env.NEXT_PUBLIC_API_URL;

  /* =========================
     FETCH TICKETS
  ========================= */

  const fetchTickets = async () => {
    if (!token || !collegeId) return;

    try {
      const res = await fetch(
        `${base}/api/v1/tickets?college_id=${collegeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [collegeId, token]);

  /* =========================
     KPI CALCULATIONS
  ========================= */

  const kpis = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === "PENDING").length;
    const solved = tickets.filter(t => t.status === "SOLVED").length;
    const ignored = tickets.filter(t => t.status === "IGNORED").length;

    return { total, pending, solved, ignored };
  }, [tickets]);

  /* =========================
     FILTERED DATA
  ========================= */

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = t.original_query
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      const matchCategory =
        categoryFilter === "ALL" || t.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [tickets, search, statusFilter, categoryFilter]);

  /* =========================
     ACTIONS
  ========================= */

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${base}/api/v1/tickets/${id}?status=${status}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTickets();
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;

    await fetch(`${base}/api/v1/tickets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchTickets();
  };

  /* =========================
     EXPORT CSV
  ========================= */

  const exportCSV = () => {
    const headers = [
      "Question",
      "Category",
      "Language",
      "Status",
      "Created At",
    ];

    const rows = filteredTickets.map(t => [
      t.original_query,
      t.category,
      t.user_language,
      t.status,
      t.created_at,
    ]);

    const csv =
      [headers, ...rows]
        .map(row =>
          row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tickets.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* =========================
     UI
  ========================= */

  if (loading) {
    return (
      <div className="container py-5 text-center">
        Loading tickets…
      </div>
    );
  }

  return (
    <div className="container py-4">

      <h3 className="fw-bold mb-4">Unanswered Queries (Tickets)</h3>

      {/* ================= KPI ROW ================= */}
      <div className="row g-3 mb-4">
        <Kpi title="Total" value={kpis.total} />
        <Kpi title="Pending" value={kpis.pending} color="warning" />
        <Kpi title="Solved" value={kpis.solved} color="success" />
        <Kpi title="Ignored" value={kpis.ignored} color="secondary" />
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search question…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="form-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="SOLVED">Solved</option>
          <option value="IGNORED">Ignored</option>
        </select>

        <select
          className="form-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {[...new Set(tickets.map(t => t.category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button className="btn btn-outline-dark" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {/* ================= TABLE ================= */}
      {filteredTickets.length === 0 ? (
        <p className="text-muted">No tickets match the filters.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Language</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ maxWidth: 360 }}>
                    {ticket.original_query}
                  </td>

                  <td>{ticket.category}</td>
                  <td>{ticket.user_language}</td>

                  <td>
                    <span className={`badge bg-${
                      ticket.status === "PENDING"
                        ? "warning text-dark"
                        : ticket.status === "SOLVED"
                        ? "success"
                        : "secondary"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>

                  <td>
                    {new Date(ticket.created_at).toLocaleString()}
                  </td>

                  <td className="text-end d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStatus(ticket.id, "SOLVED")}
                    >
                      Solve
                    </button>

                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => updateStatus(ticket.id, "IGNORED")}
                    >
                      Ignore
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================
   KPI COMPONENT
========================= */

function Kpi({ title, value, color = "dark" }: any) {
  return (
    <div className="col-md-3">
      <div className={`card border-${color}`}>
        <div className="card-body text-center">
          <small className="text-muted">{title}</small>
          <h3 className={`fw-bold text-${color}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}
