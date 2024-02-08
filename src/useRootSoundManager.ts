// Use at root of app to manage sound loading and instance sync.
import { createPlayer } from "./players";
import { useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { State } from "~/state";
import { getPiano } from "~/Piano";

export function useRootSoundManager(state: State) {
  const loading = useSignal(false);

  // When playerSpec changes, load new player.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const playerSpec = track(() => state.playerSpec);

    if (loading.value) {
      return;
    }

    console.info("Loading", playerSpec);
    loading.value = true;
    state.playerLoading = true;

    // Load the desired player
    createPlayer(playerSpec.sf, playerSpec.name).then(loaded => {
      console.info("Loaded", loaded);
      if (loaded) {
        getPiano().setPlayer(loaded);
        state.playerLoading = false;
      }
      loading.value = false;
    });
  });
}
