import type { QRL } from "@builder.io/qwik";
import {
  $,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

const initState = {
  url: null as URL | null,
};

type SpaState = typeof initState;

export const SPA = createContextId<SpaState>("spa");

export function useSpaRoot() {
  const state = useStore(initState);
  useContextProvider(SPA, state);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    function update() {
      if (state.url?.toString() !== location.href) {
        state.url = new URL(location.href);
        window.dispatchEvent(new CustomEvent("spa_route"));
      }
    }

    update();
    window.addEventListener("popstate", update);

    cleanup(() => {
      window.removeEventListener("popstate", update);
    });
  });

  return state;
}

export function useSpaRouter(update?: QRL<(url: URL) => void>) {
  const state = useContext(SPA);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!update) {
      return;
    }

    update(new URL(location.href));

    function handler() {
      if (update && state.url) {
        update(state.url);
      }
    }

    window.addEventListener("spa_route", handler);

    cleanup(() => {
      window.removeEventListener("spa_route", handler);
    });
  });

  return {
    url: state.url,
    navigate: $((newUrl: string, replace = false) => {
      if (replace) {
        history.replaceState(null, "", newUrl);
      } else {
        history.pushState(null, "", newUrl);
      }
      state.url = new URL(newUrl, location.href);
      window.dispatchEvent(new CustomEvent("spa_route"));
    }),
  };
}
