import React from "react";

export default function TrustBar() {
  const items = [
    "Evidence summaries & citations",
    "HIPAA-safe design",
    "Built for clinicians & consumers",
    "Backed by lab-grade QA",
  ];
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {items.map((t, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm flex items-center gap-2 hover:border-emerald-500/50 transition"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200">{t}</span>
        </div>
      ))}
    </div>
  );
}