import {
  $,
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Container900, Content900, H1, HeadingNav, HrFinal } from "~/ui/Common";
import Paths from "~/Paths";
import Keyboard from "~/ui/Keyboard";
import type { ActiveKeys } from "~/Piano";
import { getPiano } from "~/Piano";
import BigPlay from "~/ui/BigPlay";
import Title from "~/ui/Title";

type Action = "stop" | "play" | "setTitle";

const example = Paths.chordPrefix("/43,56,60,62,65/G7b9sus");
// http://localhost:5173/chord/69,47,82,60?sf=Mellotron.mk2_flute

const ChordPage = component$(() => {
  const { url } = useLocation();
  const navigate = useNavigate();

  const activeKeys = useSignal<ActiveKeys>(new Set());
  const title = useSignal("");
  const action = useSignal<Action>("stop");
  const timeout = useSignal(null as number | null);

  const reset = $(() => {
    //action.value = "stop";
    getPiano().stopAll();
    // activeKeys.value = new Set();
    // title.value = "";
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

  const save = $(() => {});

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
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

    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    piano.stopAll();

    if (action.value === "setTitle") {
      // save(null, true);
      action.value = "stop";
      return;
    }

    if (action.value === "play") {
      activeKeys.value.forEach(note => piano.startNote(note));
      timeout.value = window.setTimeout(() => {
        action.value = "stop";
      }, 5000);
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
          <Link prefetch={false} href={example}>
            chord
          </Link>{" "}
          or share it with others? Tap some notes or play your MIDI keyboard
          (Chrome only), and click <i>Save</i>. You can share the resulting page
          URL or bookmark it.
        </p>
      </Content900>

      <Keyboard
        key={url.toString()}
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
          onClick$={save}
          id="save"
          class="btn btn-primary med-btn"
          style={{ marginLeft: "1em" }}
        >
          <i class="fa fa-floppy-o" aria-hidden="true" /> <span>Save</span>
        </button>
      </Container900>

      {/*<Content900>*/}
      {/*  <SoundSelector />*/}
      {/*  <PianoShepardMode piano={piano} />*/}
      {/*</Content900>*/}

      {/*<Content900>*/}
      {/*  {params.notes && (*/}
      {/*    <section>*/}
      {/*      <h3>Share it</h3>*/}
      {/*      <p>*/}
      {/*        Copy to clipboard:{" "}*/}
      {/*        <Saver href={window.location.href} title={title} />*/}
      {/*      </p>*/}
      {/*    </section>*/}
      {/*  )}*/}
      {/*</Content900>*/}

      <HrFinal />
    </div>
  );
});

export default ChordPage;

export const head: DocumentHead = {
  title: "Chord page",
  meta: [],
};
