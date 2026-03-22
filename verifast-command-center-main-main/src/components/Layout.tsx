import { NavLink, Outlet } from "react-router-dom";
import { Activity, BrainCircuit, LineChart, Radio } from "lucide-react";

const navItems = [
  { to: "/live-feed", label: "Live Feed", icon: Activity },
  { to: "/fact-checker", label: "Manual Fact Check", icon: BrainCircuit },
  { to: "/analytics", label: "Analytics", icon: LineChart },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/80 px-6 py-4 shadow-lg shadow-cyan-500/10 md:h-screen md:w-64 md:border-r">
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">VeriFast AI</p>
              <h1 className="text-lg font-semibold text-white">Command Center</h1>
            </div>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/5 ${
                    isActive ? "bg-primary/10 text-primary" : "text-slate-400"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-10 rounded-md border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            <p className="font-semibold uppercase tracking-widest text-slate-400">Health</p>
            <p className="mt-2 text-green-400">Systems nominal</p>
            <p className="text-slate-500">API latency &lt; 120ms</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-5 py-6 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
