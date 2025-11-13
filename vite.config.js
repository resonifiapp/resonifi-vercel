import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for Resonifi (plain React + Tailwind)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
