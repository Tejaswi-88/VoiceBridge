"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    title: "Multilingual NLP",
    icon: "bi-translate",
    desc: "Understand and respond in multiple languages for diverse communities.",
  },
  {
    title: "Intent Recognition & Context Management",
    icon: "bi-lightbulb",
    desc: "Accurately detect user intent and maintain context across conversations.",
  },
  {
    title: "Voice and Text Support",
    icon: "bi-mic",
    desc: "Seamless interaction through both speech and text channels.",
  },
  {
    title: "Privacy & Security",
    icon: "bi-shield-lock",
    desc: "Robust encryption and compliance to protect sensitive information.",
  },
  {
    title: "Custom Dashboard",
    icon: "bi-speedometer2",
    desc: "Intuitive dashboard for monitoring, analytics, and customization.",
  },
  {
    title: "Platform Integration",
    icon: "bi-plug",
    desc: "Easily integrate with existing educational platforms and tools.",
  },
];

export default function Features() {
  return (
    <section id="resources" className="global1-bg-dark h1-color py-5">
      <div className="container px-5">
        <h2 className=" display-5 text-center fw-bold mb-4 scroll-fade-up">
          Powerful AI Features for Education
        </h2>

        <div className="row g-4">
          {features.map((f) => (
            <div key={f.title} className="col-md-4 scroll-fade-up">
              <div className="card card-custom h-100 text-center bg-secondary text-light">
                <div className="card-body">
                  {/* Circle with icon */}
                  <div className="circle-icon mx-auto mb-3">
                    <i className={f.icon}></i>
                  </div>
                  <h5 className="card-title">{f.title}</h5>
                  <p className="card-text">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
