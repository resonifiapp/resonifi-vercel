import React from "react";
import TopBar from "./TopBar.jsx";
import BottomNav from "./BottomNav.jsx";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-main">{children}</main>
      <BottomNav />
    </div>
  );
}

export default Layout;
