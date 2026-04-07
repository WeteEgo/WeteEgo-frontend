"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Fixed radial glows for hero / marketing backgrounds */
export function GlowBackdrop() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -left-[20%] -top-[10%] h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[15%] h-[min(480px,75vw)] w-[min(480px,75vw)] rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[20%] -top-[10%] h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
        animate={{ opacity: [0.45, 0.72, 0.45], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[20%] -right-[15%] h-[min(480px,75vw)] w-[min(480px,75vw)] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,184,0,0.1) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
        animate={{ opacity: [0.38, 0.58, 0.38], x: [0, -16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
