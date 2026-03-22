export type Verdict = "TRUE" | "FALSE" | "MISLEADING";

export type FeedSample = {
  claim: string;
  source: string;
  region: string;
  timestamp: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  tags: string[];
};

export const feedSamples: FeedSample[] = [
  {
    claim: "தமிழ்நாடு நாளை முழு ஊரடங்கு அறிவித்ததாக வாட்ஸ்அப் செய்தி",
    source: "WhatsApp Forward",
    region: "Chennai",
    timestamp: "2026-03-17T05:30:00+05:30",
    verdict: "FALSE",
    confidence: 93,
    explanation: "மாநில அரசு எந்த புதிய ஊரடங்கு அறிவிப்பையும் வெளியிடவில்லை.",
    tags: ["Lockdown", "Tamil Nadu"],
  },
  {
    claim: "CBSE பரிட்சைகள் 2026 முழுவதும் ரத்து செய்யப்பட்டது",
    source: "Telegram Channel",
    region: "Delhi",
    timestamp: "2026-03-17T07:05:00+05:30",
    verdict: "MISLEADING",
    confidence: 88,
    explanation: "பரிட்சை அட்டவணையில் மாற்றங்கள் மட்டும்; முழு ரத்து இல்லை.",
    tags: ["Education"],
  },
  {
    claim: "அனைத்து குடிமக்களுக்கும் ₹5000 திட்டம் உடனடியாக வழங்கப்படும்",
    source: "Facebook Post",
    region: "Kolkata",
    timestamp: "2026-03-17T08:20:00+05:30",
    verdict: "FALSE",
    confidence: 91,
    explanation: "மத்திய அரசு இதுபோன்ற திட்டத்தை அறிவிக்கவில்லை.",
    tags: ["Economy"],
  },
  {
    claim: "ISRO Chandrayaan-3 லேண்டர் இன்னும் தரவை அனுப்புகிறது",
    source: "News Broadcast",
    region: "Bengaluru",
    timestamp: "2026-03-17T09:10:00+05:30",
    verdict: "TRUE",
    confidence: 94,
    explanation: "ISRO அதிகாரப்பூர்வ புதுப்பிப்பு இதை உறுதி செய்கிறது.",
    tags: ["Space"],
  },
  {
    claim: "வெந்நீர் குடித்து COVID-ஐ முற்றிலும் தடுக்கலாம்",
    source: "YouTube Video",
    region: "Hyderabad",
    timestamp: "2026-03-17T10:00:00+05:30",
    verdict: "FALSE",
    confidence: 90,
    explanation: "இந்த சிகிச்சைக்கு மருத்துவ ஆதாரம் இல்லை.",
    tags: ["Health"],
  },
  {
    claim: "நாளை இந்தியா முழுவதும் இணைய சேவை நிறுத்தப்படும்",
    source: "Twitter",
    region: "Mumbai",
    timestamp: "2026-03-17T10:45:00+05:30",
    verdict: "MISLEADING",
    confidence: 85,
    explanation: "தேசிய அளவில் இணையத் துண்டிப்பு எதுவும் திட்டமிடப்படவில்லை.",
    tags: ["Connectivity"],
  },
];

export const verdictTheme: Record<Verdict, { color: string; border: string; label: string }> = {
  TRUE: {
    color: "text-success",
    border: "border-emerald-500/40",
    label: "TRUE",
  },
  FALSE: {
    color: "text-destructive",
    border: "border-red-500/40",
    label: "FALSE",
  },
  MISLEADING: {
    color: "text-warning",
    border: "border-amber-500/40",
    label: "MISLEADING",
  },
};
