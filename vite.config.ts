import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact(), tailwindcss()],
  publicDir: "public",
  assetsInclude: ["**/*.mp4"],
  server: {
    fs: {
      strict: false,
      allow: [".."],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "animation-vendor": ["gsap", "@gsap/react", "framer-motion"],
          "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
          "router-vendor": ["@tanstack/react-router"],
          "ui-vendor": ["@lobehub/icons", "lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
