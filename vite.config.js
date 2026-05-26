import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://nsi.sec.usace.army.mil/nsiapi",
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
      "/tiles": {
        target:
          "https://ml-dev.sec.usace.army.mil/nsi-ml/tileservice/services/nsi-all-pub/tiles",
        rewrite: (path) => path.replace(/^\/tiles/, ""),
        changeOrigin: true,
      },
    },
  },
});
