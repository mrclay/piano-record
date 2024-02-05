import {
  component$,
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import * as Tone from "tone";
import { RouterHead } from "./components/router-head/router-head";
import type { State } from "~/state";
import { initState, pianoSpec, playerSpecFromUrl } from "~/state";
import { useRootSoundManager } from "~/useRootSoundManager";

import "./index.scss";
import "./ui/Keyboard/index.scss";

export const CTX = createContextId<State>("all");

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */

  const state = useStore(initState);
  useContextProvider(CTX, state);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    state.playerSpec = playerSpecFromUrl() || pianoSpec;

    document.addEventListener("click", () => {
      // Hack to directly tie a keypress to sound generation so the WebAudio API
      // will allow sound on the page.
      const sine = new Tone.Oscillator(60, "sine").toDestination();
      sine.volume.value = -60;
      sine.start();
      sine.stop();
    });
  });

  useRootSoundManager(state);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <title>mrclay.org</title>
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
