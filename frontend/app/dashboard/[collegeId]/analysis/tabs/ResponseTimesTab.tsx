"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type ResponseTrend = {
  date: string;
  avg_response_time_ms: number;
  message_count: number;
};

export default function ResponseTimesTab() {
  const { collegeId } = useParams();
  const [data, setData] = useState<ResponseTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${base}/api/v1/analytics/${collegeId}/response-times`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const metrics = useMemo(() => {
    if (!data.length) return null;

    const totalMessages = data.reduce((acc, d) => acc + d.message_count, 0);

    const overallAvg =
      data.reduce((acc, d) => acc + d.avg_response_time_ms, 0) /
      data.length;

    const latest = data[data.length - 1];

    let status = "Optimal";
    if (overallAvg < 2000) status = "Excellent";
    else if (overallAvg >= 2000 && overallAvg <= 5000) status = "Optimal";
    else if (overallAvg > 5000 && overallAvg <= 8000) status = "Needs Optimization";
    else if (overallAvg > 8000 && overallAvg <= 10000) status = "Critical";
    else if (overallAvg > 10000) status = "Severe Degradation"; 

    return {
      totalMessages,
      overallAvg: Math.round(overallAvg),
      latestAvg: Math.round(latest.avg_response_time_ms),
      status,
    };
  }, [data]);


  if (loading) {
    return <div className="py-4 text-muted">Loading response analytics…</div>;
  }

  if (!data.length) {
    return <div className="py-4 text-muted">No response data available.</div>;
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Avg Response Time (ms)",
        data: data.map(d => d.avg_response_time_ms),
        borderColor: "#3A4A4F",
        backgroundColor: "rgba(58,74,79,0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="container-fluid">

      {/* ================= KPI ROW ================= */}
      {metrics && (
        <div className="row g-3 mb-4">
          <Kpi title="7-Day Average" value={`${metrics.overallAvg} ms`} />
          <Kpi title="Latest Day Avg" value={`${metrics.latestAvg} ms`} />
          <Kpi title="Messages (7d)" value={metrics.totalMessages} />
          <Kpi title="Performance Status" value={metrics.status} />
        </div>
      )}

      {/* ================= LINE CHART ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Response Time Trend</h5>
          <Line data={chartData} />
        </div>
      </div>

      {/* ================= SLA INDICATOR ================= */}
      {metrics && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Performance Benchmark</h6>

            <div className="progress" style={{ height: "14px" }}>
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(metrics.overallAvg / 100, 100)}%`,
                  backgroundColor:
                    metrics.overallAvg < 2000
                      ? "#2e7d32"   // Excellent (green)
                      : metrics.overallAvg <= 5000
                      ? "#ef6c00"   // Optimal (orange)
                      : metrics.overallAvg <= 8000
                      ? "#c62828"   // Needs Optimization (red)
                      : metrics.overallAvg <= 10000
                      ? "#6a1b9a"   // Critical (purple)
                      : "#000000",  // Severe Degradation (black)
                }}
              />
            </div>

            <small className="text-muted mt-2 d-block">
              Benchmark: &lt;2000ms Excellent | 2000–5000ms Optimal | 
              5000–8000ms Needs Optimization | 8000–10000ms Critical | &gt;10000ms Severe Degradation
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE ================= */

function Kpi({ title, value }: { title: string; value: any }) {
  return (
    <div className="col-md-3">
      <div className="card shadow-sm text-center">
        <div className="card-body">
          <small className="text-muted">{title}</small>
          <h4 className="fw-bold mt-1">{value}</h4>
        </div>
      </div>
    </div>
  );
}