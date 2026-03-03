"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ================= ROLE MAP ================= */

const ROLE_MAP: Record<number, string> = {
  1: "Student",
  2: "Parent",
  3: "Faculty",
  4: "Admin",
  5: "Volunteer",
};

type InsightData = {
  conversations_per_role: any[];
  messages_per_role: any[];
  category_per_role: any[];
  top_questions: any[];
};

export default function LogsPage() {
  const { collegeId } = useParams();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const base = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${base}/api/v1/analytics/${collegeId}/role-insights`)
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.error("Failed to load insights:", err))
      .finally(() => setLoading(false));
  }, [collegeId]);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        Loading behavior insights…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid py-5 text-center text-danger">
        Failed to load data.
      </div>
    );
  }

  /* ================= ROLE ENGAGEMENT ================= */

  const roleLabels = data.conversations_per_role.map(
    r => ROLE_MAP[r.role_id] || `Role ${r.role_id}`
  );

  const roleBarData = {
    labels: roleLabels,
    datasets: [
      {
        label: "Conversations",
        data: data.conversations_per_role.map(r => r.count),
        backgroundColor: "#1E2A2F",
      },
      {
        label: "Messages",
        data: data.messages_per_role.map(r => r.count),
        backgroundColor: "#3A4A4F",
      },
    ],
  };

  /* ================= CATEGORY PER ROLE ================= */

  const roleCategoryMap: Record<string, Record<string, number>> = {};

  data.category_per_role.forEach(item => {
    const roleName =
      ROLE_MAP[item.role_id] || `Role ${item.role_id}`;

    if (!roleCategoryMap[roleName]) {
      roleCategoryMap[roleName] = {};
    }

    if (!roleCategoryMap[roleName][item.category]) {
      roleCategoryMap[roleName][item.category] = 0;
    }

    roleCategoryMap[roleName][item.category] += item.count;
  });


  /* ================= ROLE vs CATEGORY MATRIX ================= */

    // If backend sends empty data → fallback demo values
    const hasDynamicData =
    data.category_per_role &&
    data.category_per_role.length > 0;

    let categories: string[] = [];
    let roleCategoryBarData: any;

    if (hasDynamicData) {
    // --------- DYNAMIC DATA ---------

    const categoriesSet = new Set<string>();
    data.category_per_role.forEach(item => {
        categoriesSet.add(item.category);
    });

    categories = Array.from(categoriesSet);

    const roleCategoryMatrix: Record<string, number[]> = {};

    Object.entries(ROLE_MAP).forEach(([id, name]) => {
        roleCategoryMatrix[name] = categories.map(cat => {
        const match = data.category_per_role.find(
            item =>
            item.role_id === Number(id) &&
            item.category === cat
        );
        return match ? match.count : 0;
        });
    });

    roleCategoryBarData = {
        labels: categories,
        datasets: Object.entries(roleCategoryMatrix).map(
        ([role, values], index) => ({
            label: role,
            data: values,
            backgroundColor: [
            "#1E2A2F",
            "#3A4A4F",
            "#5C6D70",
            "#7A8C8F",
            "#A0B2B5",
            ][index % 5],
        })
        ),
    };

    } else {
    // --------- STATIC FALLBACK DATA ---------

    categories = ["Admissions", "Hostel", "Academics", "Technical"];

    roleCategoryBarData = {
        labels: categories,
        datasets: [
        {
            label: "Student",
            data: [40, 25, 15, 5],
            backgroundColor: "#1E2A2F",
        },
        {
            label: "Faculty",
            data: [5, 2, 30, 10],
            backgroundColor: "#3A4A4F",
        },
        {
            label: "Admin",
            data: [8, 3, 10, 35],
            backgroundColor: "#5C6D70",
        },
        {
            label: "Volunteer",
            data: [10, 5, 10, 0],
            backgroundColor: "#465052",
        },
        ],
    };
    }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Behavior & Conversation Insights</h2>
        <p className="text-muted">
          Role-based analytics and question trends
        </p>
      </div>

      {/* ROLE ENGAGEMENT CHART */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Role Engagement Overview
          </h5>
          <div style={{ height: "280px" }}>
            <Bar
              data={roleBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY PER ROLE */}
      <div className="row">
        {Object.entries(roleCategoryMap).map(
          ([role, categories]) => {
            const pieData = {
              labels: Object.keys(categories),
              datasets: [
                {
                  data: Object.values(categories),
                  backgroundColor: [
                    "#131515",
                    "#1E2A2F",
                    "#3A4A4F",
                    "#5C6D70",
                    "#7A8C8F",
                    "#A0B2B5",
                  ],
                },
              ],
            };

            return (
              <div key={role} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      {role} — Category Breakdown
                    </h6>
                    <div style={{ height: "250px" }}>
                      <Pie
                        data={pieData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ROLE vs CATEGORY MATRIX */}
        <div className="card shadow-sm mb-4">
        <div className="card-body">
            <h5 className="fw-bold mb-3">
                Role vs Category Interaction
                {/* }{!hasDynamicData && (
                    <span className="badge bg-warning text-dark ms-2">
                    Demo Data
                    </span>
                )} */}
            </h5>
            <div style={{ height: "350px" }}>
            <Bar
                data={roleCategoryBarData}
                options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top" },
                },
                }}
            />
            </div>
        </div>
        </div>


      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Top 10 Most Asked Questions
          </h5>

          {data.top_questions.length === 0 ? (
            <p className="text-muted">
              No question data available.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_questions.map((q, i) => (
                    <tr key={i}>
                      <td>{q.question}</td>
                      <td className="fw-bold">{q.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}