import React from "react";

interface CuriosityLocksProps { to?: string; }

const tiles = [
  {
    title: "Top 10 risky Rx + supplement combos",
    tease: "See which pairs spike bleeding risk, sedation, or liver strain.",
  },
  {
    title: "Your personal interaction report",
    tease: "Generate a PDF you can share with your clinician.",
  },
  {
    title: "Evidence details & strength grading",
    tease: "See citations, effect sizes, & confidence levels.",
  },
];

export default function CuriosityLocks({ to = "/pricing" }: CuriosityLocksProps) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {tiles.map((t, i) => (
        <a
          key={i}
          href={to}
          className="group relative rounded-xl border border-slate-800 bg-slate-900/70 p-5 overflow-hidden hover:border-emerald-500/50 transition"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm group-hover:backdrop-blur-[1px] transition" />
          <h3 className="relative text-white font-semibold">{t.title}</h3>
          <p className="relative mt-2 text-slate-400">{t.tease}</p>
          <div className="relative mt-4 inline-flex items-center gap-2 text-emerald-300">
            <span className="text-xs uppercase tracking-wide">Upgrade to view</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
          </div>
        </a>
      ))}
    </div>
  );
}