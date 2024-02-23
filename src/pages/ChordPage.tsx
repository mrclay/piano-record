import {
  $,
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

import { useSpaRouter } from "~/useSpaRouter";
import BigPlay from "~/ui/BigPlay";
import Keyboard from "~/ui/Keyboard";
import Ops from "~/Ops";
import Paths from "~/Paths";
import type { ActiveKeys } from "~/Piano";
import { getPiano } from "~/Piano";
import Title from "~/ui/Title";
import Saver from "~/ui/Saver";
import SoundSelector, { useSfParams } from "~/ui/SoundSelector";
import { Container900, Content900, H1, HeadingNav, HrFinal } from "~/ui/Common";

type Action = "stop" | "play" | "setTitle";

const example = Paths.chordPrefix("/43,56,60,62,65/G7b9sus");
// http://localhost:5173/chord/69,47,82,60?sf=Mellotron.mk2_flute

const ChordPage = component$(() => {
  const sfParams = useSfParams();
  const loc = useLocation();

  const activeKeys = useSignal<ActiveKeys>(new Set());
  const title = useSignal("");
  const action = useSignal<Action>("stop");
  const timeout = useSignal(null as number | null);

  const urlUpdate = $((url: URL) => {
    const pathname = url.pathname;
    const searchParams = url.searchParams;
    const offset = parseInt(searchParams.get("transpose") || "0");
    const segments = pathname
      .toString()
      .split("/")
      .filter(el => el.trim() !== "");
    const notes = segments[1] || "";
    const encodedTitle = segments[2] || "";

    const initActiveKeys: ActiveKeys = new Set();
    const notesArr = notes ? notes.split(",") : [];
    notesArr.forEach(note => {
      initActiveKeys.add(parseInt(note) + offset);
    });
    activeKeys.value = initActiveKeys;
    title.value = decodeURIComponent(encodedTitle || "");
    action.value = "stop";
  });

  const { navigate } = useSpaRouter(urlUpdate);

  const notesStr =
    loc.url.pathname
      .toString()
      .split("/")
      .filter(el => el.trim() !== "")[1] || "";

  const reset = $(() => {
    action.value = "stop";
    getPiano().stopAll();
    activeKeys.value = new Set();
    title.value = "";
    navigate(Paths.chordPrefix("/"));
  });

  const handleTitleSet = $((newTitle: string) => {
    title.value = newTitle.trim();
    action.value = "setTitle";
  });

  const onKeyClick = $((note: number) => {
    action.value = "play";

    const ret = new Set(activeKeys.value);
    ret[ret.has(note) ? "delete" : "add"](note);
    activeKeys.value = ret;
  });

  const save = $((replaceState = false) => {
    const notes: number[] = [];
    notes.push(...activeKeys.value.values());

    if (!notes.length) {
      return;
    }

    let path = notes.join(",");
    if (title.value) {
      path += "/" + Ops.fixedEncodeURIComponent(title.value);
    }

    const query = sfParams.toString();
    const url = Paths.chordPrefix(path) + (query ? `?${query}` : ``);
    navigate(url, replaceState);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    if (location.hash) {
      // legacy URLs
      const m = location.hash.match(/n=([\d,]+)(?:&c=(.*))?/);
      if (m) {
        const path = m[2] ? `/${m[1]}/${m[2]}` : `/${m[1]}`;
        location.href = Paths.chordPrefix(path);
      }
    }

    document.title = "Simple Chord";

    function localReset() {
      action.value = "stop";
      getPiano().stopAll();
      activeKeys.value = new Set();
      title.value = "";
    }

    getPiano().addEventListener("reset", localReset);

    cleanup(() => {
      getPiano().removeEventListener("reset", localReset);
    });
  });

  useTask$(async ({ track }) => {
    track(() => [action.value, activeKeys.value]);

    const piano = getPiano();

    if (timeout.value && typeof window !== "undefined") {
      window.clearTimeout(timeout.value);
    }
    piano.stopAll();

    if (action.value === "setTitle") {
      action.value = "stop";
      save(true);
      return;
    }

    if (action.value === "play") {
      activeKeys.value.forEach(note => piano.startNote(note));
      if (typeof window !== "undefined") {
        timeout.value = window.setTimeout(() => {
          action.value = "stop";
        }, 5000);
      }
    }
  });

  return (
    <div>
      <HeadingNav />

      <Content900>
        <div class="d-flex justify-content-between">
          <H1>Chord</H1>

          <button
            type="button"
            onClick$={reset}
            id="reset"
            class="btn btn-lg btn-link text-danger text-decoration-none"
          >
            <i class="fa fa-trash" aria-label="Reset" /> New
          </button>
        </div>

        <p>
          Wanna capture a{" "}
          <a href="#" preventdefault:click onClick$={() => navigate(example)}>
            chord
          </a>{" "}
          or share it with others? Tap some notes or play your MIDI keyboard
          (Chrome only), and click <i>Save</i>. You can share the resulting page
          URL or bookmark it.
        </p>
      </Content900>

      <Keyboard
        key={loc.url.toString()}
        activeKeys={activeKeys.value}
        onKeyClick={onKeyClick}
      />

      <Container900 moreClass="mt-3">
        <BigPlay
          isPlaying={action.value === "play"}
          handlePlay={$(() => {
            action.value = "play";
          })}
          handleStop={$(() => {
            action.value = "stop";
          })}
          progress={0}
          isWaiting={false}
        />

        <Title title={title.value} onChange={handleTitleSet} />
        {!title.value && "(click to rename)"}

        <button
          type="button"
          onClick$={() => save()}
          id="save"
          class="btn btn-primary med-btn"
          style={{ marginLeft: "1em" }}
        >
          <i class="fa fa-floppy-o" aria-hidden="true" /> <span>Save</span>
        </button>
      </Container900>

      <Content900>
        <SoundSelector />
        {/*<PianoShepardMode piano={piano} />*/}
      </Content900>

      <Content900>
        {notesStr !== "" && (
          <section>
            <h3>Share it</h3>
            <p>
              Copy to clipboard:{" "}
              <Saver href={loc.url.toString()} title={title.value} />
            </p>
          </section>
        )}
      </Content900>

      <HrFinal />
    </div>
  );
});

export default ChordPage;

export const head: DocumentHead = {
  title: "Chord page",
  meta: [],
};
