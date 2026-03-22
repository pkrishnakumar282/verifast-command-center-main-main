export type FactCheckResponse = {
  verdict: "TRUE" | "FALSE" | "MISLEADING";
  confidence: number;
  explanation: string;
};

export type NewsArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5001" : window.location.origin);

export async function runFactCheck(text: string): Promise<FactCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/fact-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Unable to verify the claim right now.");
  }

  return response.json();
}

export async function fetchNews(): Promise<{ source: string; articles: NewsArticle[] }> {
  const response = await fetch(`${API_BASE_URL}/news`);
  if (!response.ok) {
    throw new Error("Unable to fetch news feed");
  }
  const payload = await response.json();
  return payload;
}
