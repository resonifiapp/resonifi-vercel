import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,   // 👈 allow access from your iPhone on the LAN
    port: 5173,   // 👈 keep this matching capacitor.config.json
  },
});
