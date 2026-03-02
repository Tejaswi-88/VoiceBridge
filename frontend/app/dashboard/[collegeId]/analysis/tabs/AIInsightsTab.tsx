"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

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

type ResponseTrend = {
  date: string;
  avg_response_time_ms: number;
  message_count: number;
};

type HourData = {
  hour: number;
  message_count: number;
};

export default function AIInsightsTab() {
  const { collegeId } = useParams();

  const [kpis, setKpis] = useState<KPI | null>(null);
  const [unanswered, setUnanswered] = useState<Unanswered[]>([]);
  const [responseData, setResponseData] = useState<ResponseTrend[]>([]);
  const [activity, setActivity] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${base}/api/v1/analytics/${collegeId}/kpis`),
      fetch(`${base}/api/v1/analytics/${collegeId}/unanswered`),
      fetch(`${base}/api/v1/analytics/${collegeId}/response-times`),
      fetch(`${base}/api/v1/analytics/${collegeId}/activity-patterns`)
    ])
      .then(async ([k, u, r, a]) => {
        setKpis(await k.json());
        setUnanswered(await u.json());
        setResponseData(await r.json());
        setActivity(await a.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const insights = useMemo(() => {
    if (!kpis) return [];

    const list: string[] = [];

    // Knowledge Gap Insight
    if (unanswered.length > 0) {
      const topGap = unanswered.reduce((max, u) =>
        u.count > max.count ? u : max
      );
      list.push(
        `Most unresolved queries are in "${topGap.category}". Consider enriching knowledge base content for this category.`
      );
    }

    // Performance Insight
    if (kpis.avg_response_time_ms > 5000) {
      list.push(
        "Average response time exceeds optimal threshold (5s). System performance optimization recommended."
      );
    } else if (kpis.avg_response_time_ms < 2000) {
      list.push(
        "Response times are excellent. AI system performance is highly efficient."
      );
    }

    // Engagement Insight
    if (kpis.resolution_rate < 70) {
      list.push(
        "Resolution rate is below optimal. Review unanswered queries to improve knowledge coverage."
      );
    } else {
      list.push(
        "High resolution rate indicates effective AI knowledge coverage."
      );
    }

    // Activity Insight
    if (activity.length > 0) {
      const peak = activity.reduce((max, h) =>
        h.message_count > max.message_count ? h : max
      );
      list.push(
        `Peak user engagement occurs around ${peak.hour}:00. Consider monitoring system performance during this period.`
      );
    }

    return list;
  }, [kpis, unanswered, activity]);

  if (loading) {
    return <div className="py-4 text-muted">Generating AI insights…</div>;
  }

  if (!kpis) {
    return <div className="py-4 text-muted">No insight data available.</div>;
  }

  return (
    <div className="container-fluid">

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">AI Performance Summary</h5>

          <div className="row g-3">
            <Metric title="Resolution Rate" value={`${kpis.resolution_rate}%`} />
            <Metric title="Avg Response Time" value={`${Math.round(kpis.avg_response_time_ms)} ms`} />
            <Metric title="Active Users" value={kpis.active_users} />
            <Metric title="Total Conversations" value={kpis.total_conversations} />
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">AI-Generated Insights</h5>

          {insights.length === 0 ? (
            <p className="text-muted">No insights available.</p>
          ) : (
            insights.map((insight, i) => (
              <div
                key={i}
                className="p-3 mb-2 rounded"
                style={{
                  backgroundColor: "#F4F6F7",
                  borderLeft: "4px solid #1E2A2F"
                }}
              >
                {insight}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <div className="col-md-3">
      <div className="border rounded p-3 text-center">
        <small className="text-muted">{title}</small>
        <h5 className="fw-bold mt-1">{value}</h5>
      </div>
    </div>
  );
}