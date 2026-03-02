"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

type KPI = {
  total_conversations: number;
  active_users: number;
  avg_response_time_ms: number;
  resolution_rate: number;
};

type HourData = {
  hour: number;
  message_count: number;
};

type ResponseTrend = {
  date: string;
  avg_response_time_ms: number;
  message_count: number;
};

export default function CallAnalyticsTab() {
  const { collegeId } = useParams();

  const [kpis, setKpis] = useState<KPI | null>(null);
  const [activity, setActivity] = useState<HourData[]>([]);
  const [trend, setTrend] = useState<ResponseTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${base}/api/v1/analytics/${collegeId}/kpis`),
      fetch(`${base}/api/v1/analytics/${collegeId}/activity-patterns`),
      fetch(`${base}/api/v1/analytics/${collegeId}/response-times`)
    ])
      .then(async ([k, a, r]) => {
        setKpis(await k.json());
        setActivity(await a.json());
        setTrend(await r.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const metrics = useMemo(() => {
    if (!kpis) return null;

    const totalCalls = kpis.total_conversations;

    const totalMessages = activity.reduce((acc, a) => acc + a.message_count, 0);
    const peakHour =
      activity.length > 0
        ? activity.reduce((max, h) =>
            h.message_count > max.message_count ? h : max
          ).hour
        : 0;

    const avgPerDay =
      trend.length > 0
        ? Math.round(
            trend.reduce((acc, t) => acc + t.message_count, 0) /
              trend.length
          )
        : 0;

    let intensity = "Moderate";
    if (totalCalls > 100) intensity = "High";
    if (totalCalls < 20) intensity = "Low";

    return {
      totalCalls,
      peakHour,
      avgPerDay,
      intensity,
    };
  }, [kpis, activity, trend]);

  if (loading) {
    return <div className="py-4 text-muted">Loading call analytics…</div>;
  }

  if (!kpis) {
    return <div className="py-4 text-muted">No call data available.</div>;
  }

  const hourlyMap = Array.from({ length: 24 }, (_, hour) => {
    const found = activity.find(a => a.hour === hour);
    return found ? found.message_count : 0;
  });

  const barData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Call Volume",
        data: hourlyMap,
        backgroundColor: "#1E2A2F",
      },
    ],
  };

  const lineData = {
    labels: trend.map(t => t.date),
    datasets: [
      {
        label: "Daily Call Volume",
        data: trend.map(t => t.message_count),
        borderColor: "#131515",
        backgroundColor: "#3A4A4F",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container-fluid">

      {/* KPI Row */}
      {metrics && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <Metric title="Total Calls" value={metrics.totalCalls} />
          </div>
          <div className="col-md-3">
            <Metric title="Avg Calls / Day" value={metrics.avgPerDay} />
          </div>
          <div className="col-md-3">
            <Metric title="Peak Hour" value={`${metrics.peakHour}:00`} />
          </div>
          <div className="col-md-3">
            <Metric title="Call Intensity" value={metrics.intensity} />
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="row g-3">
        {/* Left: Hourly Distribution */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-1">Hourly Call Distribution</h5>
              <p className="text-muted small mb-3">
                Displays how user interactions are distributed across each hour of the day,
                helping identify peak engagement periods.
              </p>
              <Bar data={barData} />
            </div>
          </div>
        </div>

        {/* Right: Daily Trend */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-1">Daily Call Trend</h5>
              <p className="text-muted small mb-3">
                Shows daily call volume over the last 7 days to track growth,
                consistency, and engagement fluctuations.
              </p>
              <Line data={lineData} />
            </div>
          </div>
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
        <h4 className="fw-bold mt-1">{value}</h4>
      </div>
    </div>
  );
}
