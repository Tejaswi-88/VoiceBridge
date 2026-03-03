"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface IconPosition {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  dx: number; // horizontal travel distance
  dy: number; // vertical travel distance
}

const icons = [
  "bi-translate",
  "bi-chat-dots",
  "bi-mic",
  "bi-cpu",
  "bi-robot",
  "bi-text-paragraph",
  "bi-journal-text",
  "bi-emoji-smile",
  "bi-globe",
  "bi-people",
  "bi-book",
  "bi-headset",
  "bi-pencil",
  "bi-lightbulb",
  "bi-cloud",
];

export default function Hero() {
  const [positions, setPositions] = useState<IconPosition[]>([]);
  const router = useRouter();

  useEffect(() => {
    const generated = Array.from({ length: icons.length }, () => ({
      top: Math.random() * 100, // anywhere in vh-100
      left: Math.random() * 100, // anywhere in vw
      size: 24 + Math.random() * 24,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 10, // some fast, some slow
      dx: Math.random() * 200 - 100, // random horizontal drift
      dy: Math.random() * 200 - 100, // random vertical drift
    }));
    setPositions(generated);
  }, []);

  return (
    <section
      id="home"
      className="global1-bg-dark text-center d-flex align-items-center vh-100 py-5 position-relative overflow-hidden"
    >
      {/* Floating icons */}
      {positions.map((pos, i) => (
        <i
          key={i}
          className={`floating-icon ${icons[i % icons.length]}`}
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            fontSize: `${pos.size}px`,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`,
            // custom properties for random drift
            ["--dx" as any]: `${pos.dx}px`,
            ["--dy" as any]: `${pos.dy}px`,
          }}
        ></i>
      ))}

      <div className="container px-5">
        <h1 className="display-5 h1-color fw-bold py-3">
          Multilingual AI Voice Agent for Students & Parents Support
        </h1>
        <p
          className="fw-bold text-light mt-4 mx-auto p-3"
          style={{ maxWidth: "800px" }}
        >
          Seamless conversational solutions for educational institutions with
          multilingual support, 24/7 availability, and privacy-first design.
        </p>
        <div className="d-flex justify-content-center gap-5 mt-4 flex-wrap py-3">
          <button className="btn btn-primary-custom btn-lg px-4 py-2 me-3" onClick={() => router.push("/login")}
          >
            Try Voice Assistant
          </button>
          <button className="btn btn-secondary-custom btn-lg px-4 py-2"><b>
            Request a Demo
          </b></button>
        </div>
        <p className="mt-4 text-light small p-2">
          24/7 Support • Multi-lingual Ready • Privacy Compliant
        </p>
      </div>

      <style jsx>{`
        .floating-icon {
          position: absolute;
          color: rgba(255, 255, 255, 0.85);
          opacity: 0.8;
          animation-name: roam;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        @keyframes roam {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(var(--dx), var(--dy)) rotate(180deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
