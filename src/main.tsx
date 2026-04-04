import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Register SW update listener to auto-reload on new version
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            // New version available, reload to get latest
            window.location.reload();
          }
        });
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
