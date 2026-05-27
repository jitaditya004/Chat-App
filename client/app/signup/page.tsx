"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1
    }));

    const maxDist = 120;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${1 - dist / maxDist})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      await apiFetch("/auth/signup", {
        method: "POST",
        body: { username, password }
      });

      router.replace("/home");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-black via-neutral-900 to-black text-white flex flex-col lg:flex-row">

      {/* Global Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full">

        {/* Branding */}
        <div className="flex items-center justify-center lg:w-1/2 h-64 md:h-80 lg:h-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Chat App
            </h1>

            <p className="mt-4 text-gray-400 max-w-sm">
              Real-time conversations with friends, teams and communities.
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="flex items-center justify-center lg:w-1/2 p-6 md:p-10">

          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">

            <div className="text-center">
              <h2 className="text-2xl font-semibold">Create Account</h2>
              <p className="text-gray-400 text-sm mt-1">
                Start chatting instantly
              </p>
            </div>

            <div className="space-y-4">

              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />

              <input
                type="password"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="disabled:opacity-45 w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-white hover:underline"
              >
                Login
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}