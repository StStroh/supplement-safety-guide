import React from "react";
import { useNavigate } from "react-router-dom";

export default function NeuroCTA() {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center text-center mt-16 mb-12">
      <h2 className="text-4xl font-bold text-white mb-3">
        Check your supplement safety in 3 seconds
      </h2>
      <p className="text-slate-300 mb-6">
        Type a supplement or medication — we’ll show safe combinations instantly.
      </p>
      <button
        onClick={() => navigate("/starter")}
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg shadow-lg hover:shadow-emerald-600/30 transition"
      >
        Try Free Safety Check →
      </button>
      <p className="text-xs text-slate-400 mt-3">
        No signup required • Verified clinical data
      </p>
    </section>
  );
}