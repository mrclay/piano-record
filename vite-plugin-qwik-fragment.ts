/**
 * Creates embed-friendly dist/fragment.html
 *
 * Install qwik: `npm create qwik@latest`
 * Configure static: https://qwik.builder.io/docs/guides/static-site-generation/#static-site-generation-config
 * In adapters/static/vite.config.ts place vitePluginQwikFragment() after the staticAdapter.
 * Build: `npm run build`
 *   The file `dist/fragment.html` will be created.
 * To test: `npx serve dist` and open http://localhost:3000/fragment.html
 *
 * @link https://gist.github.com/mrclay/5e0f8e3f30f546023f87a047b09d6ee8
 */

import * as fs from "node:fs";

export default function vitePluginQwikFragment() {
  return {
    name: "vite-plugin-qwik-fragment",
    enforce: "post",
    closeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        if (!fs.existsSync("dist/index.html")) {
          return;
        }

        const markup = fs.readFileSync("dist/index.html").toString();
        const { documentFragment } = extractQwikMarkup(markup);
        fs.writeFileSync("dist/fragment.html", documentFragment);
      },
    },
  };
}

function extractQwikMarkup(markup: string) {
  let styles = "";
  const htmlAttrs: Record<string, string | undefined> = {};
  let body = "";
  let bootScripts = "";

  markup.replace(/<html ([^>]+)>/, (m0, m1: string) => {
    m1.replace(/(q[^= ]+)(="([^"]*)")?/g, (m0, m1, m2, m3) => {
      htmlAttrs[m1] = m3 ? m3 : "";
      return m0;
    });

    return m0;
  });

  markup.replace(/<style [\w\W]*?<\/style>/g, m0 => {
    styles += m0;
    return m0;
  });

  markup.replace(/<body .*?>([\w\W]*?)<\/body>/, (m0, m1) => {
    body += m1;
    return m0;
  });

  markup.replace(/<\/body>([\w\W]*?)<\/html>/, (m0, m1) => {
    bootScripts += m1;
    return m0;
  });

  const addHtmlAttrsScript = `
    <script>
      (() => {
        const attrs = ${JSON.stringify(htmlAttrs)};
        const html = document.querySelector('html');
        for (const [k, v] of Object.entries(attrs)) {
          html.setAttribute(k, v);
        }
      })();
    </script>
  `
    .replace(/\n {4}/g, "\n")
    .trim();

  return {
    parts: {
      // Script to add qwik attributes to html element
      addHtmlAttrsScript,
      styles,
      body,
      bootScripts,
    },
    documentFragment: [addHtmlAttrsScript, styles, body, bootScripts].join(
      "\n"
    ),
  };
}
