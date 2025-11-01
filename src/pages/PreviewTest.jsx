import React from "react";
import { createRoot } from "react-dom/client";

export default function PreviewTest() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0b1220",
      color: "#fff",
      fontSize: 24
    }}>
      PREVIEW HOST TEST ✅
    </div>
  );
}