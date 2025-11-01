// src/pages/AppStarter.tsx
import React from "react";

// Upsell & trust components
import ProgressMeter from "../components/ProgressMeter";
import TrustBar from "../components/TrustBar";
import CuriosityLocks from "../components/CuriosityLocks";
import TestimonialLoop from "../components/TestimonialLoop";
import PricingNeuro from "../components/PricingNeuro";

export default function AppStarter() {
  return (
    <main className="px-6 py-12 text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <header className="mx-auto max-w-5xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome to the <span className="text-emerald-400">Supplement Safety Bible</span>{" "}
          <span className="text-slate-300">(Starter Access)</span>
        </h1>
        <p className="text-slate-300 md:text-lg max-w-3xl mx-auto">
          You’re exploring the free edition. Here’s what you can safely use today—and what you’ll
          unlock when you upgrade.
        </p>
      </header>

      {/* Progress bar: how much access Starter has */}
      <section className="mx-auto max-w-5xl mt-10">
        <ProgressMeter percent={5} />
      </section>

      {/* Trust badges (NSF/FDA/SSL/etc.) */}
      <section className="mx-auto max-w-5xl mt-8">
        <TrustBar />
      </section>

      {/* “Curiosity locks” — teaser cards that show value with gentle locks */}
      <section className="mx-auto max-w-6xl mt-12">
        <CuriosityLocks to="/pricing" />
      </section>

      {/* Testimonials carousel / ticker for social proof */}
      <section className="mx-auto max-w-5xl mt-12">
        <TestimonialLoop />
      </section>

      {/* Neuro-optimized pricing section (Pro highlighted) */}
      <section className="mx-auto max-w-6xl mt-14">
        <PricingNeuro highlight="pro" />
      </section>

      {/* Starter footer */}
      <footer className="mx-auto max-w-5xl text-center text-slate-500 mt-12 text-sm">
        Supplement Safety Bible © {new Date().getFullYear()} • Evidence-based supplement intelligence
      </footer>
    </main>
  );
}