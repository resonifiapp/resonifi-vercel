import React from "react";

export default function TestSimple() {
  React.useEffect(() => {
    console.log("✅ TestSimple component mounted successfully!");
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0b1220",
      color: "white",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    }}>
      <div style={{textAlign: "center"}}>
        <div style={{fontSize: 28, fontWeight: 700}}>TEST PAGE WORKS ✅</div>
        <div style={{opacity: 0.8, marginTop: 8}}>Routing + render pipeline OK</div>
        <div style={{opacity: 0.6, marginTop: 16, fontSize: 14}}>Check console for mount message</div>
      </div>
    </div>
  );
}