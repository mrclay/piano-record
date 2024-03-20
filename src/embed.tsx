import React, { Suspense, lazy, PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";

const AsyncChord = lazy(() => import("./pages/ChordPage"));
const AsyncPiano = lazy(() => import("./pages/PianoPage"));

import { useRootSoundManager } from "./useRootSoundManager";

import "./index.scss";
import "./ui/Keyboard/index.scss";

function EmbedApp({ children }: PropsWithChildren) {
  useRootSoundManager();
  return (
    <React.StrictMode>
      <Suspense>{children}</Suspense>
    </React.StrictMode>
  );
}

const links = document.querySelectorAll<HTMLAnchorElement>(".embed-ok a[href]");
links.forEach(link => {
  const url = new URL(link.href);
  if (!["mrclay.org", "localhost"].includes(url.hostname)) {
    return;
  }

  const segments = url.pathname.split("/").filter(el => el);
  let page;

  if (segments[0] === "piano" && segments[1] === "songs") {
    const stream = segments[2] || "";
    const title = segments[3];
    page = <AsyncPiano embed={{ params: { stream, title }, url }} />;
  } else if (segments[0] === "chord") {
    const notes = segments[1] || "";
    const title = segments[2];
    page = <AsyncChord embed={{ params: { notes, title }, url }} />;
  }

  if (page) {
    const div = document.createElement("div");
    div.setAttribute("data-embed", link.href);
    link.replaceWith(div);
    const root = createRoot(div);
    root.render(<EmbedApp>{page}</EmbedApp>);
  }
});
