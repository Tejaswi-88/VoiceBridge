"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const benefits = [
  {
    title: "Reduced Staff Workload",
    desc: "Automates routine inquiries, freeing staff for more critical tasks.",
    icon: "bi-gear",
  },
  {
    title: "Improved Parent Satisfaction",
    desc: "Instant multilingual responses improve communication and trust.",
    icon: "bi-chat-dots",
  },
  {
    title: "Easy Onboarding & Maintenance",
    desc: "Minimal IT effort required for setup and upkeep.",
    icon: "bi-cloud-check",
  },
];

export default function Benefits() {
  return (
    <section id="about" className="global1-bg-dark py-5">
      <div className="container px-5">
        <h2 className="display-5 text-center h1-color fw-bold mb-4 scroll-fade-up">
          Transform Your Institution's Communication
        </h2>

        <div className="row g-4">
          {benefits.map((b) => (
            <div key={b.title} className="col-md-4 scroll-fade-up">
              <div className="card card-custom h-100 text-center bg-secondary text-light">
                <div className="card-body">
                  {/* Circle with icon */}
                  <div className="circle-icon mx-auto mb-3">
                    <i className={b.icon}></i>
                  </div>
                  <h5 className="card-title">{b.title}</h5>
                  <p className="card-text">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
