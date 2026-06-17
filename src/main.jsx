import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Home } from "./pages/Home/Home.jsx";

let mounted = false;
const mountApp = () => {
  if (mounted) return;
  mounted = true;
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Home />
    </StrictMode>
  );
};

// In development mode, Vite handles CSS injection dynamically, so cssLoaded is not set.
// In production, we wait for the deferred CSS link tag onload event to fire,
// or fallback to mounting anyway after 2.5 seconds if network is extremely slow.
if (import.meta.env.DEV || window.cssLoaded) {
  mountApp();
} else {
  window.onCssLoad = mountApp;
  setTimeout(mountApp, 2500);
}
