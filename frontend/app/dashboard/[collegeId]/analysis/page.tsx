"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import OverviewTab from "./tabs/OverviewTab";
import CallAnalyticsTab from "./tabs/CallAnalyticsTab";
import ResponseTimesTab from "./tabs/ResponseTimesTab";
import ActivityPatternsTab from "./tabs/ActivityPatternsTab";
import SentimentAnalysisTab from "./tabs/SentimentAnalysisTab";
import AIInsightsTab from "./tabs/AIInsightsTab";
import KnowledgeBaseTab from "./tabs/KnowledgeBaseTab";

/* =========================
   CONSTANTS
========================= */

const TABS: { name: string; icon: string }[] = [
  { name: "Overview", icon: "bi-bar-chart" },
  { name: "Call Analytics", icon: "bi-telephone-inbound" },
  { name: "Response Times", icon: "bi-clock-history" },
  { name: "Activity Patterns", icon: "bi-graph-up" },
  { name: "Voice Quality", icon: "bi-soundwave" },
  { name: "Sentiment Analysis", icon: "bi-emoji-smile" },
  { name: "AI Insights", icon: "bi-lightbulb" },
  { name: "Knowledge Base", icon: "bi-journal-text" },
];

/* =========================
   MAIN PAGE
========================= */

export default function AnalyticsPage() {
  const { collegeId } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const [overview, setOverview] = useState<any>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ANALYTICS DATA
  ========================= */

  useEffect(() => {
    if (!collegeId) return;

    const fetchAnalytics = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;

        const [kpisRes, langRes, catRes] = await Promise.all([
          fetch(`${base}/api/v1/analytics/${collegeId}/kpis`),
          fetch(`${base}/api/v1/analytics/${collegeId}/languages`),
          fetch(`${base}/api/v1/analytics/${collegeId}/categories`),
        ]);

        setOverview(await kpisRes.json());
        setLanguages(await langRes.json());
        setCategories(await catRes.json());
      } catch (err) {
        console.error("❌ Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [collegeId]);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center text-white">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Analytics Dashboard</h2>
          <p className="text-muted mb-0">
            Comprehensive insights into your AI Voice Agent performance
          </p>
        </div>

        <div className="d-flex gap-2">
          <select className="form-select form-select-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        {TABS.map((tab) => (
          <li key={tab.name} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.name ? "active" : ""}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <i className={`${tab.icon} me-1`}></i> {tab.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <OverviewTab
          overview={overview}
          languages={languages}
          categories={categories}
        />
      )}

      {activeTab === "Call Analytics" && <CallAnalyticsTab />}

      {activeTab === "Response Times" && <ResponseTimesTab />}

      {activeTab === "Activity Patterns" && <ActivityPatternsTab />}

      {activeTab === "Sentiment Analysis" && <SentimentAnalysisTab />}

      {activeTab === "AI Insights" && <AIInsightsTab />}

      {activeTab === "Knowledge Base" && <KnowledgeBaseTab />}
    </div>
  );
}
