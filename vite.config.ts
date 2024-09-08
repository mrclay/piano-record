import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const localBuild = process.env.LOCAL === "1";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [react()],
    base: command === "serve" || localBuild ? "/" : "/piano/",
    server: {
      open: true,
    },
  };
});
