
// ✅ Layout.js — safe restore with OG/Twitter meta via Helmet
// Paste this whole file content into your Layout.js and Publish.

import React from "react";
import { Helmet } from "react-helmet";

// If you have a Header/Footer component, you can import and re-add them here.
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";

// 🔗 Your OG image living in GitHub (leave as-is or replace if you renamed)
const OG_IMAGE =
  "https://raw.githubusercontent.com/resonifiapp/resonifi/main/public/og/A_2D_digital_graphic_design_of_an_app_icon_for_the.png";

export default function Layout({ children }) {
  return (
    <>
      {/* ---------- GLOBAL <head> META ---------- */}
      <Helmet>
        <title>Resonifi™ — Feel your frequency™</title>
        <meta
          name="description"
          content="Resonifi™ blends sleep, hydration, energy, purpose, and more into your daily Wellness Index™ — a single score for how in tune you feel."
        />

        {/* Open Graph */}
        <meta property="og:title" content="Resonifi™ — Feel your frequency™" />
        <meta
          property="og:description"
          content="Track your Wellness Index™, amplify your energy, and discover what truly resonates with you."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://resonifiapp.com/" />
        <meta property="og:image" content={OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resonifi™ — Feel your frequency™" />
        <meta
          name="twitter:description"
          content="Track your Wellness Index™, amplify your energy, and discover what truly resonates with you."
        />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Theme + favicon (optional if already set elsewhere) */}
        <meta name="theme-color" content="#0B1C2E" />
        {/* <link rel="icon" href="/icons/resonifi-symbol-white-on-navy-1024.png" /> */}
      </Helmet>
      {/* ---------- END GLOBAL META ---------- */}

      {/* Page shell */}
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* <Header /> */}
        <div style={{ flex: 1 }}>{children}</div>

        {/* Global footer w/ trademarks (kept subtle) */}
        <footer
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#777",
            padding: "1rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          © 2025 <strong>Resonifi™</strong> (John-Paul Scott Cromien). All rights reserved.
          <br />
          Resonifi™, Wellness Index™, and Feel your frequency™ are trademarks of John-Paul Scott Cromien.
        </footer>
      </main>
    </>
  );
}
