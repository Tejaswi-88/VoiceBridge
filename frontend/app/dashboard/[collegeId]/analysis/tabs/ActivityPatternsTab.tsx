"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type HourData = {
  hour: number;
  message_count: number;
};

export default function ActivityPatternsTab() {
  const { collegeId } = useParams();
  const [data, setData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${base}/api/v1/analytics/${collegeId}/activity-patterns`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const metrics = useMemo(() => {
    if (!data.length) return null;

    const totalMessages = data.reduce((acc, d) => acc + d.message_count, 0);

    const peak = data.reduce((max, d) =>
      d.message_count > max.message_count ? d : max
    );

    const activeHours = data.length;

    let engagement = "Moderate";
    if (totalMessages > 100) engagement = "High";
    else if (totalMessages < 20) engagement = "Low";

    return {
      totalMessages,
      peakHour: peak.hour,
      peakCount: peak.message_count,
      activeHours,
      engagement,
    };
  }, [data]);

  if (loading) {
    return <div className="py-4 text-muted">Loading activity data…</div>;
  }

  if (!data.length) {
    return <div className="py-4 text-muted">No activity data available.</div>;
  }

  // Build full 24-hour distribution
  const hourlyMap = Array.from({ length: 24 }, (_, hour) => {
    const found = data.find(d => d.hour === hour);
    return found ? found.message_count : 0;
  });

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Messages",
        data: hourlyMap,
        backgroundColor: "#1E2A2F",
      },
    ],
  };

  return (
    <div className="container-fluid">

      {/* KPI Row */}
      {metrics && (
        <div className="row g-3 mb-4">
          <Kpi title="Peak Hour" value={`${metrics.peakHour}:00`} />
          <Kpi title="Peak Messages" value={metrics.peakCount} />
          <Kpi title="Active Hours" value={metrics.activeHours} />
          <Kpi title="Engagement Level" value={metrics.engagement} />
        </div>
      )}

      {/* Chart */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Hourly Activity Distribution</h5>
          <Bar data={chartData} />
        </div>
      </div>

      {/* Insight Card */}
      {metrics && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold mb-2">Usage Insight</h6>
            <p className="mb-0 text-muted">
              The most active hour is <strong>{metrics.peakHour}:00</strong> 
              with {metrics.peakCount} interactions. 
              Overall engagement level is <strong>{metrics.engagement}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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