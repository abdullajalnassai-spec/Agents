import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Official GitHub Pages URL: https://abdullajalnassai-spec.github.io/Agents/
const base = process.env.VITE_BASE || "/Agents/";

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
