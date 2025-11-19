import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const title = "Resonifi";

  return (
    <header
      className="top-bar"
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(5,8,22,0.96)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 40
      }}
    >
      {/* Brand / logo text */}
      <div
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={() => navigate("/home")}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 20%, #8effff, #3c7bff 60%, #2449ff)",
            marginRight: "8px"
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "15px" }}>{title}</span>
      </div>

      {/* Right side intentionally empty for now (chip removed) */}
      <div />
    </header>
  );
}

export default TopBar;
