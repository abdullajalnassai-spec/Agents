import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Relative base so the HQ works on GitHub Pages, tunnels, and mirrors without Render.
const base = process.env.VITE_BASE || "./";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
