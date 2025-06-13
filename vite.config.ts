import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Remove console.logs in production builds
    ...(process.env.NODE_ENV === "production" && {
      "console.log": "(() => {})",
      "console.warn": "(() => {})",
      "console.info": "(() => {})",
    }),
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5004",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
