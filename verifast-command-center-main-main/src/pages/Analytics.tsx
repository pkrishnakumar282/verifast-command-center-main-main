import { motion } from "framer-motion";
import { BarChart3, Database, ShieldAlert } from "lucide-react";

const statCards = [
  { label: "Claims processed", value: "12,842", change: "+8%", detail: "vs last 24h" },
  { label: "Flagged misinformation", value: "3,112", change: "-2%", detail: "false + misleading" },
  { label: "Average response", value: "1.2s", change: "-12%", detail: "API latency" },
];

const verdictBreakdown = [
  { label: "TRUE", percent: 22, color: "bg-emerald-500" },
  { label: "FALSE", percent: 48, color: "bg-red-500" },
  { label: "MISLEADING", percent: 30, color: "bg-amber-500" },
];

const regionalRisks = [
  { region: "Tamil Nadu", score: 82 },
  { region: "Delhi", score: 74 },
  { region: "Karnataka", score: 68 },
  { region: "West Bengal", score: 64 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-slate-400">Analytics</p>
          <h2 className="text-3xl font-semibold text-white">Signal Quality Dashboard</h2>
          <p className="text-sm text-slate-400">Anomaly detection across languages, regions, and claim categories.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Database className="h-4 w-4 text-primary" />
          Dataset refreshed 5 minutes ago
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="glass-panel p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">{card.label}</p>
            <p className="text-3xl font-semibold text-white">{card.value}</p>
            <p className="text-xs text-slate-400">{card.change} · {card.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <BarChart3 className="h-4 w-4 text-primary" />
            Verdict mix (24h)
          </div>
          <div className="mt-6 space-y-4">
            {verdictBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Regional risk index
          </div>
          <div className="mt-6 space-y-4">
            {regionalRisks.map((item) => (
              <div key={item.region}>
                <div className="flex items-center justify-between text-sm text-white">
                  <span>{item.region}</span>
                  <span>{item.score}</span>
                </div>
                <div className="mt-2 h-10 overflow-hidden rounded-md bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.9 }}
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
