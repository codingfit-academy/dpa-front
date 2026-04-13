import React, { useEffect, useState } from 'react';

type Petal = {
  id: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  rotation: number;
  shape: number;
};

const createPetal = (): Petal => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    left: `${Math.random() * 100}%`,
    size: Math.floor(Math.random() * 18) + 12,
    duration: Math.random() * 5 + 9,
    delay: Math.random() * 2.5,
    sway: Math.round((Math.random() - 0.5) * 110),
    opacity: Number((0.55 + Math.random() * 0.35).toFixed(2)),
    rotation: Math.floor(Math.random() * 360),
    shape: Math.floor(Math.random() * 3),
  };
};

const MAX_PETALS = 60;
const ADD_INTERVAL_MS = 600;

const FallingPetals: React.FC = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPetals((prev) => {
        const next = [...prev, createPetal()];
        return next.length > MAX_PETALS ? next.slice(next.length - MAX_PETALS) : next;
      });
    }, ADD_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const petalShapes = [
    'M40 10 C 58 10, 75 28, 60 62 C 56 80, 40 95, 40 95 C 40 95, 24 78, 20 60 C 5 28, 22 10, 40 10 Z',
    // 'M40 0 C 62 12, 72 34, 58 68 C 54 87, 40 95, 40 95 C 40 95, 26 78, 22 66, 18 40 C 14 18, 22 6, 40 0 Z',
    'M40 10 C 55 10, 68 20, 66 40 C 64 58, 57 82, 40 95 C 23 82, 16 58, 14 40 C 12 20, 25 10, 40 10 Z',
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="absolute"
          style={{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size * 1.5}px`,
            top: `-${petal.size}px`,
            opacity: petal.opacity,
            animationName: 'petal-fall',
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationFillMode: 'forwards',
            animationIterationCount: 1,
            transform: `translateX(0px) rotate(${petal.rotation}deg)`,
            ['--sway' as any]: `${petal.sway}px`,
          }}
        >
          <svg
            viewBox="0 0 80 105"
            className="block w-full h-full"
            style={{ filter: 'drop-shadow(0 5px 14px rgba(255, 160, 210, 0.24))' }}
          >
            <defs>
              <radialGradient id={`petal-gradient-${petal.id}`} cx="40" cy="20" r="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff0f7" />
                <stop offset="35%" stopColor="#ffcade" />
                <stop offset="100%" stopColor="#ff8ac8" />
              </radialGradient>
            </defs>
            <path d={petalShapes[petal.shape]} fill={`url(#petal-gradient-${petal.id})`} />
            <path
              d="M40 18 C 44 14, 50 16, 52 22 C 48 20, 44 26, 40 28 C 36 26, 32 20, 28 22 C 30 16, 36 14, 40 18 Z"
              fill="rgba(255,255,255,0.55)"
            />
            <path
              d="M40 35 C 42 32, 45 32, 47 36 C 45 34, 42 35, 40 37 C 38 35, 35 34, 33 36 C 35 32, 38 32, 40 35 Z"
              fill="rgba(255,255,255,0.35)"
            />
          </svg>
        </span>
      ))}
    </div>
  );
};

export default FallingPetals;
