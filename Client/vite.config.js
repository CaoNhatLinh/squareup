import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { cwd } from "process";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), "");
  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.SERVER_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("firebase")) return "firebase";
              if (id.includes("react-icons")) return "icons";
              if (id.includes("react") || id.includes("scheduler")) {
                if (id.includes("react-datepicker")) return "date-picker";
                if (id.includes("react-toastify")) return "toastify";
                if (id.includes("@stripe")) return "stripe";

                return "vendor-react";
              }
              if (id.includes("@stripe") || id.includes("stripe"))
                return "stripe";
              if (id.includes("@dnd-kit") || id.includes("dnd-kit"))
                return "dnd-kit";
              if (id.includes("swiper")) return "swiper";
              return "vendor";
            }
          },
        },
      },
    },
  };
});
