import React from "react";

type Highlight = "pro" | "premium" | "none";
interface PricingNeuroProps { highlight?: Highlight; }

const tiers = [
  {
    key: "starter",
    name: "Starter",
    price: "Free",
    desc: "Basic checks & limited insights",
    features: [
      "3 interaction checks / week",
      "Starter evidence cards",
      "Save 2 reports (PDF watermark)",
    ],
    cta: { label: "You’re on this plan", href: "/starter", disabled: true },
    badge: "",
  },
  {
    key: "pro",
    name: "Professional",
    price: "$9.99",
    desc: "Unlimited checks + exportable PDFs",
    features: [
      "Unlimited interaction checks",
      "Full evidence summaries & citations",
      "PDF export (no watermark)",
      "Email support",
    ],
    cta: { label: "Upgrade to Pro", href: "/pricing#pro", disabled: false },
    badge: "Most Popular",
  },
  {
    key: "premium",
    name: "Premium",
    price: "$19.99",
    desc: "Team tools & priority updates",
    features: [
      "Everything in Pro",
      "Team seats (up to 5)",
      "Priority evidence updates",
      "Early access to new modules",
    ],
    cta: { label: "Go Premium", href: "/pricing#premium", disabled: false },
    badge: "Best Value",
  },
];

export default function PricingNeuro({ highlight = "pro" }: PricingNeuroProps) {
  return (
    <section className="mx-auto max-w-6xl px-2 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Unlock the full Safety Bible</h2>
        <p className="text-slate-400 mt-2">
          Starter lets you taste it. Pro & Premium remove all limits.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => {
          const isHot =
            (highlight === "pro" && t.key === "pro") ||
            (highlight === "premium" && t.key === "premium");
          return (
            <div
              key={t.key}
              className={[
                "rounded-2xl border bg-slate-900/60 backdrop-blur p-6",
                isHot
                  ? "border-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,.6)] scale-[1.02]"
                  : "border-slate-700",
              ].join(" ")}
            >
              {t.badge && (
                <div className="mb-3">
                  <span className="text-emerald-300/90 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-400/50">
                    {t.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-white">{t.name}</h3>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{t.price}</span>
                <span className="text-slate-400 text-sm">
                  {t.key === "starter" ? "" : "/month"}
                </span>
              </div>

              <p className="text-slate-400 mt-2">{t.desc}</p>

              <ul className="mt-5 space-y-2">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={t.cta.href}
                aria-disabled={t.cta.disabled}
                className={[
                  "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 font-semibold transition",
                  t.cta.disabled
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : isHot
                    ? "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                    : "bg-slate-800 hover:bg-slate-700 text-white",
                ].join(" ")}
              >
                {t.cta.label}
              </a>

              {t.key !== "starter" && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Cancel anytime • 30-day satisfaction promise
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}