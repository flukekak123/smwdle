'use client';

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';

const COLORS = ['#6d5efc', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#eab308'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
}

const ConfettiContext = createContext<() => void>(() => undefined);
export const useConfetti = () => useContext(ConfettiContext);

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | undefined>(undefined);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of particles.current) {
      p.vy += 0.16; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    particles.current = particles.current.filter((p) => p.life > 0 && p.y < c.height + 40);
    if (particles.current.length) {
      raf.current = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, c.width, c.height);
      raf.current = undefined;
    }
  }, []);

  const fire = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.35;
    for (let i = 0; i < 160; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 9;
      particles.current.push({
        x: cx + (Math.random() - 0.5) * 140,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length]!,
        life: 80 + Math.random() * 50,
      });
    }
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <ConfettiContext.Provider value={fire}>
      {children}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true" />
    </ConfettiContext.Provider>
  );
}
