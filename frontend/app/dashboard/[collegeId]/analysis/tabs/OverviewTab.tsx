"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

/* =========================
   CONSTANTS
========================= */

const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  es: "Spanish",
  fr: "French",
  de: "German",
  ar: "Arabic",
  ko: "Korean",
  ja: "Japanese",
};

/* =========================
   OVERVIEW TAB
========================= */

export default function OverviewTab({
  overview,
  languages,
  categories,
}: any) {
  const { collegeId } = useParams();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${base}/api/v1/analytics/${collegeId}/activity-patterns`)
      .then(res => res.json())
      .then(setActivityData)
      .catch(console.error)
      .finally(() => setLoadingActivity(false));
  }, [collegeId]);

  const peakMetrics = useMemo(() => {
    if (!activityData.length) return null;
    const peak = activityData.reduce((max, d) =>
      d.message_count > max.message_count ? d : max
    );
    return {
      hour: peak.hour,
      count: peak.message_count,
    };
  }, [activityData]);

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <KpiCard title="Total Conversations" value={overview.total_conversations} />
        <KpiCard title="Active Users" value={overview.active_users} />
        <KpiCard
          title="Avg Response Time"
          value={`${(overview.avg_response_time_ms / 1000).toFixed(1)}s`}
        />
        <KpiCard title="Resolution Rate" value={`${overview.resolution_rate}%`} />
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <Card title="Language Distribution" icon="bi-translate">
            <p className="text-dark-50 mb-1 small">
              Conversations by language preferences
            </p>
            {languages.map((l: any) => (
              <Progress
                key={l.language}
                label={LANGUAGE_MAP[l.language] || l.language}
                value={l.percentage}
              />
            ))}
          </Card>
        </div>

        <div className="col-md-4">
          <Card title="Query Categories" icon="bi-diagram-3">
            <p className="text-dark-50 mb-1 small">
              Most common inquiry types
            </p>
            {categories.map((c: any) => (
              <CategoryItem
                key={c.category}
                label={c.category}
                value={`${c.count} (${c.percentage}%)`}
              />
            ))}
          </Card>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="row g-3">
        <MiniStat
          title="Peak Usage"
          value={
            loadingActivity
              ? "Loading..."
              : peakMetrics
              ? `${peakMetrics.hour}:00`
              : "—"
          }
          subtitle={
            peakMetrics ? `${peakMetrics.count} messages` : ""
          }
        />
        <MiniStat
          title="Coverage"
          value={languages.length}
          subtitle="Languages Supported"
        />
        <MiniStat title="Accuracy" value="95.42%" subtitle="Intent recognition" />
      </div>
    </>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function KpiCard({ title, value }: any) {
  return (
    <div className="col-md-3">
      <div className="card h-100">
        <div className="card-body">
          <small className="text-muted">{title}</small>
          <h3 className="fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="fw-bold mb-3">
          {icon && <i className={`${icon} me-2`}></i>}
          {title}
        </h6>
        {children}
      </div>
    </div>
  );
}

function Progress({ label, value }: any) {
  return (
    <div className="mb-2">
      <small>{label}</small>
      <div className="progress" style={{ height: "10px", backgroundColor: "#e9ecef" }}>
        <div
          className="progress-bar"
          style={{
            width: `${value}%`,
            backgroundColor: "#131515",
          }}
        ></div>
      </div>
      <small className="text-muted">{value}%</small>
    </div>
  );
}

function CategoryItem({ label, value }: any) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniStat({ title, value, subtitle }: any) {
  return (
    <div className="col-md-4">
      <div className="card h-100 text-center">
        <div className="card-body">
          <small className="text-muted">{title}</small>
          <h3 className="fw-bold">{value}</h3>
          <small className="text-muted">{subtitle}</small>
        </div>
      </div>
    </div>
  );
}
