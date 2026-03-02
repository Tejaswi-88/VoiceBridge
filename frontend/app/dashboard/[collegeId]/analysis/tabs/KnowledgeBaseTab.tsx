"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

/* =========================
   REGISTER CHART.JS MODULES
========================= */
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

/* =========================
   TYPES
========================= */

type FailedFile = {
  id: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
};

type KbGap = {
  category: string;
  count: number;
};

type DistItem = {
  type?: string;
  category?: string;
  count: number;
};

type KbSummary = {
  total_files: number;
  failed_files: number;
  file_types: DistItem[];
  file_categories: DistItem[];
};

/* =========================
   COMPONENT
========================= */

export default function KnowledgeBaseTab() {
  const { collegeId } = useParams();

  const [summary, setSummary] = useState<KbSummary | null>(null);
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const [kbGaps, setKbGaps] = useState<KbGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${base}/api/v1/analytics/${collegeId}/kb/summary`),
      fetch(`${base}/api/v1/analytics/${collegeId}/kb/failed-files`),
      fetch(`${base}/api/v1/analytics/${collegeId}/unanswered`)
    ])
      .then(async ([s, f, g]) => {
        if (s.ok) setSummary(await s.json());
        if (f.ok) setFailedFiles(await f.json());
        if (g.ok) setKbGaps(await g.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  if (loading) {
    return <div className="text-muted py-4">Loading KB analytics…</div>;
  }

  return (
    <div className="container-fluid">

      {/* ================= KPIs ================= */}
      {summary && (
        <div className="row g-3 mb-4">
          <Kpi title="Total KB Files" value={summary.total_files} />
          <Kpi title="Failed Files" value={summary.failed_files} />
          <Kpi title="File Types" value={summary.file_types.length} />
          <Kpi title="Categories" value={summary.file_categories.length} />
        </div>
      )}

      {/* ================= DISTRIBUTIONS ================= */}
      <div className="row g-4 mb-4">
        {/* FILE TYPES → Pie Chart */}
        <DistributionCard
          title="File Type Distribution"
          items={summary?.file_types}
          labelKey="type"
          chartType="pie"
        />

        {/* FILE CATEGORIES → Bar Chart */}
        <DistributionCard
          title="File Category Distribution"
          items={summary?.file_categories}
          labelKey="category"
          chartType="bar"
        />
      </div>

      {/* ================= KB GAPS ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-bold">Knowledge Gaps</h5>
          {kbGaps.length === 0 ? (
            <p className="text-muted">No unanswered queries.</p>
          ) : (
            kbGaps.map(g => (
              <div key={g.category} className="d-flex justify-content-between">
                <span>{g.category}</span>
                <span className="badge bg-warning text-dark">{g.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= FAILED FILES ================= */}
      <div className="card">
        <div className="card-body">
          <h5 className="fw-bold">Failed / Unprocessed Files</h5>

          {failedFiles.length === 0 ? (
            <p className="text-muted">All files processed successfully.</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {failedFiles.map(f => (
                  <tr key={f.id}>
                    <td>{f.file_name}</td>
                    <td>{f.file_type}</td>
                    <td>{new Date(f.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

/* =========================
   REUSABLE
========================= */

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="col-md-3">
      <div className="card text-center">
        <div className="card-body">
          <small className="text-muted">{title}</small>
          <h3 className="fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function DistributionCard({
  title,
  items,
  labelKey,
  chartType
}: {
  title: string;
  items?: any[];
  labelKey: string;
  chartType: "pie" | "bar";
}) {
  if (!items || items.length === 0) {
    return (
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="fw-bold">{title}</h5>
            <p className="text-muted">No data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const labels = items.map(i => i[labelKey]);
  const dataCounts = items.map(i => i.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Count",
        data: dataCounts,
        backgroundColor: [
          "#131515",
          "#1E2A2F",
          "#3A4A4F",
          "#5C6D70",
          "#7A8C8F",
          "#A0B2B5"
        ]
      }
    ]
  };

  return (
    <div className="col-md-6">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="fw-bold">{title}</h5>
          {chartType === "pie" ? (
            <Pie data={chartData} />
          ) : (
            <Bar data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}
