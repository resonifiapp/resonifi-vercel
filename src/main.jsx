import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import PlausiblePing from "./PlausiblePing.jsx";
import PlausibleListener from "./PlausibleListener.jsx";
import "./index.css"; // ✅ add this line

const root = document.getElementById("root");
createRoot(root).render(
  <>
    <PlausiblePing />
    <PlausibleListener />
    <App />
  </>
);

