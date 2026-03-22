import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Loader2, Radar, RefreshCcw } from "lucide-react";
import { feedSamples, type FeedSample, verdictTheme } from "@/data/feedSamples";
import { fetchNews, type NewsArticle } from "@/lib/api";

type FeedEvent = FeedSample & { id: string };

const processingLines = [
  "Scanning Tamil and English chatter…",
  "Cross-checking official bulletins…",
  "Clustering similar claims…",
  "Ranking misinformation risk…",
];

const verdictBg: Record<FeedSample["verdict"], string> = {
  TRUE: "bg-emerald-500/10",
  FALSE: "bg-red-500/10",
  MISLEADING: "bg-amber-500/10",
};

const makeEvent = (sample: FeedSample): FeedEvent => ({
  ...sample,
  timestamp: new Date().toISOString(),
  id: `${sample.region}-${Math.random().toString(36).slice(2)}`,
});

export default function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(() => feedSamples.slice(0, 4).map(makeEvent));
  const [processingIndex, setProcessingIndex] = useState(0);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSource, setNewsSource] = useState("mock");

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) => {
        const sample = feedSamples[Math.floor(Math.random() * feedSamples.length)];
        const next = [makeEvent(sample), ...prev];
        return next.slice(0, 10);
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProcessingIndex((value) => (value + 1) % processingLines.length);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  const loadNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const payload = await fetchNews();
      setNews(payload.articles ?? []);
      setNewsSource(payload.source ?? "mock");
    } catch (error) {
      setNewsError(error instanceof Error ? error.message : "Unable to reach news feed");
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const intervalId = setInterval(() => {
      loadNews();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const stats = useMemo(
    () => ({
      total: 1284,
      highRisk: events.filter((item) => item.verdict !== "TRUE").length,
      accuracy: 94.2,
    }),
    [events],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-slate-400">Live Intelligence</p>
          <h2 className="text-3xl font-semibold text-white">National Misinformation Feed</h2>
          <p className="text-sm text-slate-400">Streaming realtime claims from social + news in Indian languages.</p>
        </div>
        <div className="flex gap-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Claims / 24h</p>
            <p className="text-2xl font-semibold text-white">{stats.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">High Risk</p>
            <p className="text-2xl font-semibold text-red-400">{stats.highRisk}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Model Accuracy</p>
            <p className="text-2xl font-semibold text-emerald-400">{stats.accuracy}%</p>
          </div>
        </div>
      </header>

      <section className="glass-panel p-5">
        <div className="flex flex-col gap-2 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Live Headlines</p>
            <p className="text-lg font-semibold text-white">Trusted sources feed ({newsSource})</p>
          </div>
          <button
            onClick={loadNews}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-primary"
          >
            Refresh
            {newsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {newsLoading && news.length === 0 && (
            <p className="col-span-3 text-sm text-slate-400">Loading verified headlines…</p>
          )}
          {newsError && (
            <p className="col-span-3 text-sm text-destructive">{newsError}</p>
          )}
          {!newsLoading && news.length === 0 && !newsError && (
            <p className="col-span-3 text-sm text-slate-400">No fresh headlines available.</p>
          )}
          {news.map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary"
            >
              <p className="text-xs uppercase tracking-widest text-slate-500">{article.source}</p>
              <p className="mt-1 text-sm font-semibold text-white">{article.title}</p>
              <p className="mt-2 text-xs text-slate-400">{article.description}</p>
              <p className="mt-3 text-[11px] text-slate-500">{new Date(article.publishedAt).toLocaleString()}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="glass-panel md:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">AI Processing</p>
              <p className="text-lg font-semibold text-white">Signal Radar</p>
            </div>
            <Radar className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="px-5 py-6">
            <div className="relative h-28 overflow-hidden rounded-md bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30">
              <div className="absolute inset-0 animate-[spin_6s_linear_infinite] bg-[conic-gradient(var(--primary)_30deg,transparent_120deg)] opacity-50" />
              <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-4 text-sm text-white">
                <span className="font-mono text-xs uppercase tracking-[0.4em] text-white/60">Phase</span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {processingLines[processingIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 px-5 py-4 text-xs text-slate-400">
            Last refresh: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="glass-panel md:col-span-3">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Engine Status</p>
              <p className="text-lg font-semibold text-white">Realtime Throughput</p>
            </div>
            <RefreshCcw className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div className="grid gap-4 px-5 py-6 text-sm text-slate-300 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Streams</p>
              <p className="text-2xl font-semibold text-white">28</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Latency</p>
              <p className="text-2xl font-semibold text-emerald-400">118 ms</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Tamil Share</p>
              <p className="text-2xl font-semibold text-cyan-400">37%</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
