import React, { useEffect, useState } from "react";

const quotes = [
  {
    q: "Clean, fast, and finally specific about interactions. This is what I needed in clinic.",
    a: "Family Nurse Practitioner",
  },
  { q: "The PDF report saved me a back-and-forth with my cardiologist.", a: "Subscriber" },
  { q: "Exactly the right level of evidence. Not hype—useful.", a: "Pharmacist" },
];

export default function TestimonialLoop() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % quotes.length), 3500);
    return () => clearInterval(id);
  }, []);
  const item = quotes[idx];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
      <p className="text-slate-200 text-lg transition-opacity duration-500">{“${item.q}”}</p>
      <p className="mt-2 text-slate-400 text-sm">— {item.a}</p>
      <div className="mt-3 flex justify-center gap-2">
        {quotes.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === idx ? "bg-emerald-400" : "bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}