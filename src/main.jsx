import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initAnalytics } from "./lib/analytics.js";
import { initMonitoring } from "./lib/monitoring.js";

// Init dans le bon ordre
initMonitoring(); // Sentry en premier
initAnalytics();  // PostHog ensuite

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);