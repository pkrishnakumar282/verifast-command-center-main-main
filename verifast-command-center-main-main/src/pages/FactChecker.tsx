import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { runFactCheck, type FactCheckResponse } from "@/lib/api";

const verdictColors: Record<FactCheckResponse["verdict"], string> = {
  TRUE: "text-success",
  FALSE: "text-destructive",
  MISLEADING: "text-warning",
};

export default function FactChecker() {
  const [text, setText] = useState("தமிழ்நாட்டில் நாளை முழு ஊரடங்கு என்கிறார்கள்?");
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [submittedText, setSubmittedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setSubmittedText(text.trim());
      const payload = await runFactCheck(text.trim());
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify the claim right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-slate-400">Manual Review</p>
        <h2 className="text-3xl font-semibold text-white">Fact Check Workbench</h2>
        <p className="text-sm text-slate-400">Send any rumour or headline in Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, or English.</p>
      </header>

      <section className="glass-panel p-6">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Claim</label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white focus:border-primary focus:outline-none"
          placeholder="Paste the exact message you received…"
        />
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary/90 px-6 py-2 text-sm font-semibold text-background transition hover:bg-primary disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? "Analyzing" : "Verify Claim"}
          </button>
          <p className="text-xs text-slate-400">API endpoint: /fact-check</p>
        </div>

        {loading && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            />
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </section>

      {result && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Verdict</p>
              <p className={`text-3xl font-semibold ${verdictColors[result.verdict]}`}>{result.verdict}</p>
            </div>
            <div className="w-full md:w-64">
              <p className="text-xs uppercase tracking-widest text-slate-400">Confidence</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-white">{result.confidence}% certainty</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white">Claim</p>
              <p>{submittedText}</p>
            </div>
            <p className="font-semibold text-white">Explanation</p>
            <p>{result.explanation}</p>
          </div>
        </motion.section>
      )}
    </div>
  );
}
