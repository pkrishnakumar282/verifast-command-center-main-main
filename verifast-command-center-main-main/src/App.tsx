import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/Layout";
import LiveFeed from "@/pages/LiveFeed";
import FactChecker from "@/pages/FactChecker";
import Analytics from "@/pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/live-feed" replace />} />
          <Route path="/live-feed" element={<LiveFeed />} />
          <Route path="/fact-checker" element={<FactChecker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/live-feed" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
