import { component$, useContext, useSignal, $ } from "@builder.io/qwik";
import { availableInstruments, SoundFont } from "~/players";
import { CTX } from "~/root";
import type { PlayerSpec } from "~/state";
import { pianoSpec } from "~/state";

const SoundSelector = component$(() => {
  const state = useContext(CTX);
  const undosRef = useSignal<PlayerSpec[]>([]);

  const update = $((spec: PlayerSpec) => {
    undosRef.value.push(state.playerSpec);
    state.playerSpec = spec;
  });
  const undo = $(() => {
    const popped = undosRef.value.pop();
    if (popped) {
      state.playerSpec = popped;
    }
  });

  const { sf, name } = state.playerSpec;

  return (
    <div style={{ marginTop: "1rem" }}>
      <span class="sound-selectors">
        <label>
          Instrument{" "}
          <select
            class="form-select"
            value={name}
            onChange$={(_, currentTarget) => {
              const name = currentTarget.value;
              update({ sf, name });
            }}
          >
            {availableInstruments[sf]!.map(name => (
              <option
                key={name}
                value={name}
                style={{ textTransform: "capitalize" }}
              >
                {name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          Soundfont{" "}
          <select
            class="form-select"
            value={sf}
            onChange$={(_, currentTarget) => {
              const newSf = currentTarget.value as SoundFont;
              const available = availableInstruments[newSf];
              const newName = available!.includes(name)
                ? state.playerSpec.name
                : available![0];
              update({ sf: newSf, name: newName });
            }}
          >
            {Object.keys(availableInstruments)
              .filter(sf => sf !== SoundFont.Null)
              .map(sf => (
                <option key={sf}>{sf}</option>
              ))}
          </select>
        </label>
        {state.playerLoading && (
          <span class="sound-selectors--loading">Loading...</span>
        )}
      </span>
      <button
        type="button"
        class="btn btn-link"
        disabled={sf === SoundFont.TonePiano && name === "acoustic_grand_piano"}
        preventdefault:click
        onClick$={() =>
          update({
            sf: SoundFont.TonePiano,
            name: "acoustic_grand_piano",
          })
        }
      >
        Default Piano
      </button>
      <button
        type="button"
        class="btn btn-link"
        disabled={undosRef.value.length === 0}
        preventdefault:click
        onClick$={() => undo()}
      >
        Undo
      </button>
    </div>
  );
});

export default SoundSelector;

export function useSfParams() {
  const { playerSpec } = useContext(CTX);

  const sfparams = new URLSearchParams();
  if (JSON.stringify(playerSpec) === JSON.stringify(pianoSpec)) {
    sfparams.delete("sf");
  } else {
    sfparams.set("sf", `${playerSpec.sf}.${playerSpec.name}`);
  }

  return sfparams;
}
