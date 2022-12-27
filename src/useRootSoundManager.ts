// Use at root of app to manage sound loading and instance sync.
import { useStore } from "./store";
import { useEffect, useRef } from "react";
import { createPlayer } from "./players";

export function useRootSoundManager() {
  const [piano] = useStore.piano();
  const loadingRef = useRef(false);
  const [player, setPlayer] = useStore.player();
  const [playerSpec] = useStore.playerSpec();

  // When playerSpec changes, load new player.
  useEffect(() => {
    if (loadingRef.current) {
      return;
    }

    console.info("Loading", playerSpec);
    loadingRef.current = true;
    // Load the desired player
    createPlayer(playerSpec.sf, playerSpec.name).then(loaded => {
      console.info("Loaded", loaded);
      if (loaded) {
        setPlayer(loaded);
      }
      loadingRef.current = false;
    });
  }, [playerSpec]);

  // When player changes, inject into piano.
  useEffect(() => {
    console.info("Injecting player in piano");
    piano.setPlayer(player);
  }, [player]);
}
