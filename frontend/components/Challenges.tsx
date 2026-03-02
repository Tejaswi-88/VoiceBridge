"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const challenges = [
  {
    title: "Long Queues",
    desc: "Students and parents wait hours for basic inquiries.",
    icon: "bi-people", // Bootstrap icon class
  },
  {
    title: "Language Barriers",
    desc: "Multilingual communities struggle to communicate effectively.",
    icon: "bi-translate",
  },
  {
    title: "Limited Hours",
    desc: "Campus offices operate only during fixed working hours.",
    icon: "bi-clock",
  },
];

export default function Challenges() {
  // activate the scroll animation observer
  useScrollAnimation();

  return (
    <section id="challenges" className=" text-center d-flex py-5">
      <div className="container px-5">
        <h2 className="display-5 h2-color fw-bold py-3 scroll-fade-up">
          Challenge of Campus Communication
        </h2>

        <div className="row g-4">
          {challenges.map((c) => (
            <div key={c.title} className="col-md-4 scroll-fade-up">
              <div className="card card-custom2 h-100 text-center">
                <div className="card-body">
                  {/* Circle with icon */}
                  <div className="circle-icon mx-auto mb-3">
                    <i className={c.icon}></i>
                  </div>
                  <h5 className="card-title2">{c.title}</h5>
                  <p className="card-text2">{c.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
