import "@/instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { reactErrorHandler } from "@sentry/react";
import "@/index.css";
import App from "@/App";

createRoot(document.getElementById("root")!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);

// Service Worker 등록 (페이지 로드 후 - FCP 개선)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("SW registration failed:", error);
    });
  });
}
