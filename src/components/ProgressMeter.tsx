import React, { useEffect, useState } from "react";

interface ProgressMeterProps { percent?: number; }

export default function ProgressMeter({ percent = 5 }: ProgressMeterProps) {
  const [p, setP] = useState(percent);

  useEffect(() => {
    const key = "starter_views";
    const views = Math.min(3, (parseInt(localStorage.getItem(key) || "0", 10) || 0) + 1);
    localStorage.setItem(key, String(views));
    const boosted = Math.min(5 + views * 5, 15); // 5% → 10% → 15%
    setTimeout(() => setP(boosted), 300);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-emerald-300">
          You’ve unlocked {p}% of the Safety Bible
        </span>
        <span className="text-sm text-slate-400">Upgrade to unlock everything</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-emerald-500 h-3 transition-all duration-700"
          style={{ width: ${p}% }}
        />
      </div>
    </div>
  );
}