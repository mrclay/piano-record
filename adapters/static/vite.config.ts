import { staticAdapter } from "@builder.io/qwik-city/adapters/static/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";
import vitePluginQwikFragment from "../../vite-plugin-qwik-fragment";

const origin = process.env.IS_LOCALHOST ? 'http://localhost:3000' : 'http://mrclay.org';

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["@qwik-city-plan"],
      },
    },
    plugins: [
      staticAdapter({
        origin,
      }),
      vitePluginQwikFragment(),
    ],
  };
});

