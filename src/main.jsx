import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import PlausiblePing from "./PlausiblePing.jsx";

const root = document.getElementById("root");
createRoot(root).render(
  <>
    <PlausiblePing />
    <App />
  </>
);

