import million from "million/compiler";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
 
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
  resolve: {
    alias: {
      src: "/src",
      modules: "/src/modules",
      components: "/src/components",
      assets: "/src/assets",
      styles: "/src/styles",
      pages: "/src/pages",
      state: "/src/state",
      api: "/src/api",
      utilities: "/src/utilities",
      configs: "/src/configs",
      hooks: "/src/hooks",
      services: "/src/services",
      translations: "/src/translations",
      classes: "/src/classes",
    }
  }
});