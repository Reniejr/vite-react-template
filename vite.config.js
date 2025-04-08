import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import million from "million/compiler";

import fs from "fs";
import path from "path";

const paths = JSON.parse(
  fs.readFileSync(path.resolve("./scripts/templates/vite/paths.json"), "utf-8"),
);

export default defineConfig({
  plugins: [
    million.vite({
      auto: {
        threshold: 0.05,
        skip: ["useBadHook", /badVariable/g],
      },
    }),
    react(),
  ],
  esbuild: {
    minify: true,
    target: "esnext",
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    target: "esnext", // Use latest JavaScript features
    brotliSize: false, // Avoid additional gzip/brotli size computation
    cssCodeSplit: true, // Only bundle used CSS
    chunkSizeWarningLimit: 1000, // Increase limit for large projects
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Rollup optimize automatically
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    terser: {
      parallel: true, // Use multiple cores for minification
    },
  },
  resolve: {
    alias: paths,
  },
});
