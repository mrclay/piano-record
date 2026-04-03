import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const localBuild = process.env.VITE_LOCAL === "1";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "serve" || localBuild ? "/" : "/piano/",
  server: {
    open: true,
  },
}));
