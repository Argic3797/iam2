import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/v1": {
        target: "https://openapi.naver.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, "/v1"),
        secure: false,
      },
      "/map-geocode": {
        target: "https://naveropenapi.apigw.ntruss.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map-geocode/, "/map-geocode"),
        secure: false,
      },
      "/map-direction": {
        target: "https://maps.apigw.ntruss.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/map-direction/, "/map-direction/v1"),
        secure: false,
      },
    },
  },
});
