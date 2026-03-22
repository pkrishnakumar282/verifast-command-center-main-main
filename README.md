# VeriFast AI Command Center

High-performance misinformation operations stack for Indian content. The platform ships with:

- **Live Feed** – simulated national stream with verdict colours, confidence bars, and animated AI processing states.
- **Manual Fact Checker** – hooks into the Express API (`/fact-check`) for instant verdicts.
- **Analytics Dashboard** – lightweight trends, verdict mix, and regional risk slices.

## Tech Stack

- React 18 + Vite + TypeScript + TailwindCSS
- Node.js + Express backend with CORS
- Framer Motion + Lucide icons for micro-interactions

## Getting Started

```bash
npm install
npm run dev        # starts Vite on 5175 + API on 5001
```

Run the API alone (useful for deployments):

```bash
node server.js
```

Backend base URL can be overridden via `.env`:

```
VITE_API_BASE_URL=https://api.example.com
```

## Project Layout

```
public/          Static assets (favicon, robots.txt)
server.js        Express API
src/
	components/    Layout + shared UI
	data/          Feed simulation seeds
	lib/           API helpers and types
	pages/         Live Feed, Fact Checker, Analytics
``` 
