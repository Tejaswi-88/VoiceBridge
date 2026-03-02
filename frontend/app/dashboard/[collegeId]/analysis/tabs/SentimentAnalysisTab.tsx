"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement
);

type KPI = {
  total_conversations: number;
  active_users: number;
  avg_response_time_ms: number;
  resolution_rate: number;
};

type Unanswered = {
  category: string;
  count: number;
};

type Trend = {
  date: string;
  message_count: number;
};

export default function SentimentAnalysisTab() {
  const { collegeId } = useParams();

  const [kpis, setKpis] = useState<KPI | null>(null);
  const [unanswered, setUnanswered] = useState<Unanswered[]>([]);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${base}/api/v1/analytics/${collegeId}/kpis`),
      fetch(`${base}/api/v1/analytics/${collegeId}/unanswered`),
      fetch(`${base}/api/v1/analytics/${collegeId}/response-times`)
    ])
      .then(async ([k, u, t]) => {
        setKpis(await k.json());
        setUnanswered(await u.json());
        setTrend(await t.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const sentiment = useMemo(() => {
    if (!kpis) return null;

    const unresolved = unanswered.reduce((acc, u) => acc + u.count, 0);

    let positive = kpis.resolution_rate;
    let negative = unresolved * 4;
    let neutral = 100 - positive - negative;

    if (neutral < 0) neutral = 5;

    const label =
      positive > 70 ? "Positive"
      : positive > 45 ? "Neutral"
      : "Negative";

    return { positive, neutral, negative, label };
  }, [kpis, unanswered]);

  if (loading) return <div className="py-4 text-muted">Analyzing sentiment...</div>;
  if (!sentiment) return <div>No sentiment data available.</div>;

  /* ---------------- PIE ---------------- */
  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [sentiment.positive, sentiment.neutral, sentiment.negative],
        backgroundColor: ["#3A7D44", "#A0B2B5", "#8B1E3F"]
      }
    ]
  };

  /* ---------------- TREND ---------------- */
  const trendData = {
    labels: trend.map(t => t.date),
    datasets: [
      {
        label: "Sentiment Index",
        data: trend.map(t => sentiment.positive - sentiment.negative),
        borderColor: "#1E2A2F",
        backgroundColor: "#3A4A4F",
        tension: 0.4
      }
    ]
  };

  /* ---------------- CATEGORY RISK ---------------- */
  const categoryData = {
    labels: unanswered.map(u => u.category),
    datasets: [
      {
        label: "Unresolved Queries",
        data: unanswered.map(u => u.count),
        backgroundColor: "#8B1E3F"
      }
    ]
  };

  return (
    <div className="container-fluid">

      {/* Overall Sentiment */}
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <h5 className="fw-bold mb-2">Overall Interaction Sentiment</h5>
          <p className="text-muted small mb-3">
            Sentiment estimation based on resolution rate,
            response efficiency, and unresolved queries.
          </p>
          <h2
            className={`fw-bold ${
              sentiment.label === "Positive"
                ? "text-success"
                : sentiment.label === "Neutral"
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {sentiment.label}
          </h2>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Metric title="Resolution Rate" value={`${kpis?.resolution_rate}%`} />
        </div>
        <div className="col-md-3">
          <Metric title="Avg Response Time" value={`${Math.round(kpis?.avg_response_time_ms || 0)} ms`} />
        </div>
        <div className="col-md-3">
          <Metric title="Unresolved Categories" value={unanswered.length} />
        </div>
        <div className="col-md-3">
          <Metric title="Overall Sentiment" value={sentiment.label} />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="row g-3 mb-4">
        {/* Left: Sentiment Distribution */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-2">Sentiment Distribution</h5>
              <p className="text-muted small">Estimated emotional tone of user interactions.</p>
              <Pie data={pieData} />
            </div>
          </div>
        </div>

        {/* Right: Trend (top) + Categories (bottom) */}
        <div className="col-md-6 d-flex flex-column">
          <div className="card shadow-sm mb-3 flex-fill">
            <div className="card-body">
              <h5 className="fw-bold mb-2">Sentiment Trend (7 Days)</h5>
              <p className="text-muted small">Tracks sentiment movement over time.</p>
              <Line data={trendData} />
            </div>
          </div>
          <div className="card shadow-sm flex-fill">
            <div className="card-body">
              <h5 className="fw-bold mb-2">High-Risk Categories</h5>
              <p className="text-muted small">Categories with most unresolved queries.</p>
              <Bar data={categoryData} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation (full width bottom) */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">AI Recommendation</h6>
          <p className="text-muted mb-0">
            {sentiment.label === "Positive" && "System performance is strong. Keep knowledge updated."}
            {sentiment.label === "Neutral" && "Moderate sentiment. Address unresolved categories."}
            {sentiment.label === "Negative" && "Immediate attention needed. Improve speed and expand knowledge base."}
          </p>
        </div>
      </div>

    </div>
  );
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <div className="card shadow-sm text-center h-100">
      <div className="card-body">
        <small className="text-muted">{title}</small>
        <h5 className="fw-bold mt-1">{value}</h5>
      </div>
    </div>
  );
}
