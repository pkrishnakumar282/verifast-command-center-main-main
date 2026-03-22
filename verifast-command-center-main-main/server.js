import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT ?? 5001);
const NEWS_API_KEY = process.env.NEWS_API_KEY ?? process.env.GNEWS_API_KEY ?? process.env.NEWSAPI_KEY ?? "";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

app.use(cors());
app.use(express.json());

const heuristics = [
  {
    pattern: /(tamil\s*nadu|india).*(lockdown|shutdown)/i,
    verdict: "FALSE",
    confidence: 92,
    explanation: "நாளைய முழு ஊரடங்கு குறித்து எந்த அரசு அறிவிப்பும் இல்லை.",
  },
  {
    pattern: /(cbse|board).*(exam|cancel)/i,
    verdict: "MISLEADING",
    confidence: 88,
    explanation: "CBSE தேர்வுகள் முழுவதும் ரத்து செய்யப்படவில்லை; அதிகாரப்பூர்வ அறிவிப்புகளை சரிபார்க்கவும்.",
  },
  {
    pattern: /(₹|rs|rupees|scheme).*(5000)/i,
    verdict: "FALSE",
    confidence: 90,
    explanation: "அனைத்து குடிமக்களுக்கு ₹5000 கொடுக்கும் புதிய மத்தியத் திட்டம் அறிவிக்கப்படவில்லை.",
  },
  {
    pattern: /(hot water|steam|15 minutes).*(covid|corona)/i,
    verdict: "FALSE",
    confidence: 89,
    explanation: "வெந்நீர் குடிப்பதால் COVID முற்றிலும் தடுக்கப்படாது; மருத்துவ ஆலோசனைகளைப் பின்பற்றவும்.",
  },
  {
    pattern: /(internet).*(shut|ban|off)/i,
    verdict: "MISLEADING",
    confidence: 86,
    explanation: "முழு இந்திய அளவில் இணையத் துண்டிப்பு குறித்து எந்த தேசிய அறிவிப்பும் இல்லை.",
  },
  {
    pattern: /(chandrayaan|isro)/i,
    verdict: "TRUE",
    confidence: 94,
    explanation: "ISRO Chandrayaan-3 மிஷன் வெற்றிகரமாக முடிவடைந்தது.",
  },
  {
    pattern: /(indian\s+navy|naval).*(escort|convoy|tanker|merchant)/i,
    verdict: "TRUE",
    confidence: 84,
    explanation: "இந்திய கடற்படை வர்த்தக கப்பல்களுக்கு பாதுகாப்பு வழங்கும் பணிகளை வழமையாக மேற்கொள்கிறது.",
  },
];

const mockNews = [
  {
    title: "Election Commission launches fact-checking war room in Delhi",
    source: "Press Trust of India",
    url: "https://example.com/ec-war-room",
    publishedAt: new Date().toISOString(),
    description: "Special cell to monitor viral misinformation across regional languages.",
  },
  {
    title: "Tamil Nadu police flag deepfake campaign ahead of bypolls",
    source: "The Hindu",
    url: "https://example.com/tn-deepfake",
    publishedAt: new Date().toISOString(),
    description: "Cyber crime wing shares guidance for spotting manipulated videos.",
  },
  {
    title: "ISRO shares Chandrayaan-3 science data dashboard",
    source: "ISRO",
    url: "https://example.com/isro-dashboard",
    publishedAt: new Date().toISOString(),
    description: "Public can now explore Vikram and Pragyan experiments online.",
  },
];

let cachedArticles = [...mockNews];

const updateNewsCache = (articles) => {
  if (Array.isArray(articles) && articles.length) {
    cachedArticles = articles;
  }
};

const sanitizeText = (text = "") =>
  text
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Component}]/gu, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3);

const findNewsSupport = (claim) => {
  const claimTokens = tokenize(claim);
  if (!claimTokens.length) return null;

  const contradictionWords = ["fake", "false", "hoax", "cancelled", "not", "no", "ban", "banned", "deepfake", "rumor", "rumour", "பொய்", "வதந்தி"];
  const hasContradiction = claimTokens.some(token => contradictionWords.includes(token));

  if (hasContradiction) {
    return null; // Don't blindly support a claim that contradicts the core news
  }

  let bestMatch = null;
  for (const article of cachedArticles) {
    const articleTokens = tokenize(`${article.title} ${article.description}`);
    if (!articleTokens.length) continue;
    const intersection = articleTokens.filter((token) => claimTokens.includes(token));
    const union = new Set([...articleTokens, ...claimTokens]);
    const score = intersection.length / union.size;
    if (score > 0.35 && score > (bestMatch?.score ?? 0)) {
      bestMatch = { article, score };
    }
  }
  return bestMatch;
};

const detectMoneyHoax = (lower) => {
  const mentionsCash = /(₹|rs|rupees|lakh|crore|தொகை|ரூ|ரூபாய்|\d{4,}|ten\s+thousand|one\s+lakh|crores?)/i.test(lower);
  const promises = /(give|deposit|credit|transfer|scheme|stipend|allowance|grant|உதவி|திட்டம்|direct benefit)/i.test(lower);
  const toEveryone = /(all\s+(citizens|students|farmers|families)|ஒவ்வொரு குடிமகன்|எல்லா குடிமக்கள்|हर नागरिक|ప్రతి ఒక్కరు)/i.test(lower);
  if (promises && toEveryone) {
    return {
      verdict: "FALSE",
      confidence: mentionsCash ? 90 : 85,
      explanation: "அனைவருக்கும் பணம் வழங்கும் அரசு அறிவிப்பிற்கு ஆதாரம் இல்லை.",
    };
  }
  return null;
};

const detectBanRumor = (lower) => {
  const targets = ["upi", "digital payment", "internet", "social media", "whatsapp", "x app"];
  const banWords = ["ban", "stop", "shutdown", "block", "restrict"];
  if (targets.some((word) => lower.includes(word)) && banWords.some((word) => lower.includes(word))) {
    return {
      verdict: "FALSE",
      confidence: 87,
      explanation: "இந்த டிஜிட்டல் சேவைகளைத் தடை செய்வதாக அரசு அறிவிப்பு இல்லை.",
    };
  }
  return null;
};

const detectHealthMyth = (lower) => {
  if (/(cure|prevent|முழுமையாக குணமாக்கலாம்|மருந்தாகும்)/i.test(lower) && /(home remedy|பானம்|drink|கஷாயம்|leaf|steam)/i.test(lower)) {
    return {
      verdict: "MISLEADING",
      confidence: 78,
      explanation: "வீட்டு வைத்தியங்களைப் பற்றிய மருத்துவ ஆதாரம் தெளிவாக இல்லை; மருத்துவர் ஆலோசனைதேவையானது.",
    };
  }
  return null;
};

const runHeuristic = (text) => {
  const cleaned = sanitizeText(text);
  const lower = cleaned.toLowerCase();

  const rule = heuristics.find((item) => item.pattern.test(lower));
  if (rule) {
    return rule;
  }

  const supported = findNewsSupport(cleaned);
  if (supported) {
    return {
      verdict: "TRUE",
      confidence: Math.min(95, Math.round(70 + supported.score * 60)),
      explanation: `${supported.article.source} வெளியிட்ட செய்தியுடன் இது ஒத்துப்போகிறது.`,
    };
  }

  const detectors = [detectMoneyHoax(lower), detectBanRumor(lower), detectHealthMyth(lower)];
  const match = detectors.find(Boolean);
  if (match) {
    return match;
  }

  return {
    verdict: "MISLEADING",
    confidence: 72,
    explanation: "அதிகாரப்பூர்வ மூலங்களில் இருந்து தகவலை உறுதிப்படுத்தவும்.",
  };
};

const parseAiResponse = (content) => {
  if (!content) throw new Error("empty AI response");
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("no JSON chunk");
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    verdict: String(parsed.verdict ?? parsed.status ?? "MISLEADING").toUpperCase(),
    confidence: Number(parsed.confidence ?? 70),
    explanation: String(parsed.explanation ?? parsed.reason ?? "Unable to justify verdict."),
  };
};

const runGroq = async (text) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are VeriFast AI. Classify Indian misinformation claims. Respond ONLY with JSON: {\"verdict\": \"TRUE|FALSE|MISLEADING\", \"confidence\": number between 60-95, \"explanation\": short Tamil or English sentence}.",
        },
        {
          role: "user",
          content: `Verify this claim: "${text}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return parseAiResponse(content);
};

const fetchLiveNews = async () => {
  if (!NEWS_API_KEY) {
    throw new Error("Missing News API key");
  }
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", "india");
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "6");
  const response = await fetch(`${url.toString()}&apiKey=${NEWS_API_KEY}`);
  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`);
  }
  const payload = await response.json();
  return (payload.articles ?? []).map((article) => ({
    title: article.title,
    source: article.source?.name ?? "Unknown",
    url: article.url,
    publishedAt: article.publishedAt,
    description: article.description ?? article.content ?? "",
  }));
};

app.get("/news", async (_req, res) => {
  try {
    const articles = await fetchLiveNews();
    updateNewsCache(articles);
    return res.json({ source: "newsapi", articles });
  } catch (error) {
    console.warn("News fallback:", error.message);
    updateNewsCache(mockNews);
    return res.json({ source: "mock", articles: mockNews });
  }
});

app.post("/fact-check", async (req, res) => {
  const text = req.body?.text ?? "";
  if (!text.trim()) {
    return res.status(400).json({ error: "A text payload is required" });
  }

  try {
    if (GROQ_API_KEY) {
      const aiResult = await runGroq(text);
      return res.json(aiResult);
    }
  } catch (error) {
    console.warn("Groq fallback:", error.message);
  }

  return res.json(runHeuristic(text));
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`VeriFast API running on port ${PORT}`);
});