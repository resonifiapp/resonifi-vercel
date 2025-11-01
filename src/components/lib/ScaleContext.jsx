import React, { createContext, useContext, useState, useEffect } from "react";
import { getScale, setScale as persistScale, SCALES } from "./scales";

const ScaleContext = createContext(null);

export function ScaleProvider({ children }) {
  const [scales, setScales] = useState(SCALES);

  const updateScale = (category, patch) => {
    persistScale(category, patch);
    setScales({ ...SCALES }); // Trigger re-render
  };

  return (
    <ScaleContext.Provider value={{ scales, updateScale }}>
      {children}
    </ScaleContext.Provider>
  );
}

export function useScales() {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScales must be used within ScaleProvider");
  }
  return context;
}