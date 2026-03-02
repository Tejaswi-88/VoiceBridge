"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    title: "Voice Interaction",
    desc: "Ask questions in your preferred language with ease.",
    icon: "bi-mic",
  },
  {
    title: "AI Processing",
    desc: "AI understands intent and context for accurate responses.",
    icon: "bi-cpu",
  },
  {
    title: "Staff Oversight",
    desc: "Staff monitor and intervene when needed for quality assurance.",
    icon: "bi-person-check",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className=" text-center d-flex py-5">
      <div className="container px-5">
        <h2 className="display-5 h2-color fw-bold py-3 scroll-fade-up">
          How It Works
        </h2>

        <div className="row g-4">
          {steps.map((s) => (
            <div key={s.title} className="col-md-4 scroll-fade-up">
              <div className="card card-custom2 h-100 text-center">
                <div className="card-body">
                  {/* Circle with icon */}
                  <div className="circle-icon mx-auto mb-3">
                    <i className={s.icon}></i>
                  </div>
                  <h5 className="card-title2">{s.title}</h5>
                  <p className="card-text2">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
