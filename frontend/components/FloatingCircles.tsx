"use client";
import { useEffect, useState } from "react";

interface CirclePosition {
  top: number;
  left: number;
  size: number;
  delay: number;
}

export default function FloatingCircles() {
  const [positions, setPositions] = useState<CirclePosition[]>([]);

  useEffect(() => {
    // Suppose you have 4 major sessions (Hero, Challenges, Features, HowItWorks, Benefits)
    // We want ~5 circles per session → 20 total
    const sessions = 4; 
    const circlesPerSession = 5;
    const totalCircles = sessions * circlesPerSession;

    const generated: CirclePosition[] = [];

    for (let s = 0; s < sessions; s++) {
      const sessionTopStart = (s / sessions) * 100;       // start % for this session
      const sessionTopEnd = ((s + 1) / sessions) * 100;   // end % for this session

      for (let i = 0; i < circlesPerSession; i++) {
        generated.push({
          top: sessionTopStart + Math.random() * (sessionTopEnd - sessionTopStart),
          left: Math.random() * 100,
          size: 40 + Math.random() * 60,
          delay: Math.random() * 5,
        });
      }
    }

    setPositions(generated);
  }, []);

  return (
    <div className="floating-circles">
      {positions.map((pos, i) => (
        <div
          key={i}
          className="circle"
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            width: `${pos.size}px`,
            height: `${pos.size}px`,
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        .floating-circles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(51, 153, 137, 0.3);
          animation: float 12s ease-in-out infinite alternate;
        }
        @keyframes float {
          from {
            transform: translateY(0) translateX(0);
          }
          to {
            transform: translateY(-40px) translateX(20px);
          }
        }
      `}</style>
    </div>
  );
}
