import { PlayerSpec, useStore } from "../store";
import { availableInstruments, SoundFont } from "../players";
import { useRef } from "react";

export default function SoundSelector() {
  const [playerSpec, setPlayerSpec] = useStore.playerSpec();
  const [playerLoading] = useStore.playerLoading();
  const undosRef = useRef<PlayerSpec[]>([]);

  const update = (spec: PlayerSpec) => {
    undosRef.current.push(playerSpec);
    setPlayerSpec(spec);
  };
  const undo = () => {
    const popped = undosRef.current.pop();
    if (popped) {
      setPlayerSpec(popped);
    }
  };

  const { sf, name } = playerSpec;

  return (
    <div style={{ marginTop: "1rem" }}>
      <span className="sound-selectors">
        <label>
          Instrument{" "}
          <select
            className="form-control"
            value={name}
            onChange={e => {
              const name = e.target.value;
              update({ sf, name });
            }}
          >
            {availableInstruments[sf]!.map(name => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>{" "}
        <label>
          Soundfont{" "}
          <select
            className="form-control"
            value={sf}
            onChange={e => {
              const newSf = e.target.value as SoundFont;
              const available = availableInstruments[newSf];
              const newName = available!.includes(name)
                ? playerSpec.name
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
        {playerLoading && (
          <span className="sound-selectors--loading">Loading...</span>
        )}
      </span>
      <button
        type="button"
        className="btn btn-link"
        disabled={sf === SoundFont.TonePiano && name === "acoustic_grand_piano"}
        onClick={e => {
          e.preventDefault();
          update({
            sf: SoundFont.TonePiano,
            name: "acoustic_grand_piano",
          });
        }}
      >
        Default Piano
      </button>
      <button
        type="button"
        className="btn btn-link"
        disabled={undosRef.current.length === 0}
        onClick={e => {
          e.preventDefault();
          undo();
        }}
      >
        Undo
      </button>
    </div>
  );
}

export interface UseSfStorage {
  saveSf(params?: URLSearchParams): URLSearchParams;
  loadSf(): void;
}

export function useSfStorage(): UseSfStorage {
  const [playerSpec, setPlayerSpec] = useStore.playerSpec();

  function saveSf(params = new URLSearchParams()) {
    params.set("sf", `${playerSpec.sf}.${playerSpec.name}`);
    return params;
  }
  function loadSf() {
    const params = new URLSearchParams(window.location.search);
    const [sf, name] = params.get("sf") || ",";

    const available = availableInstruments[sf as SoundFont];
    if (available && available.includes(name)) {
      setPlayerSpec({ sf: sf as SoundFont, name });
    }
  }

  return { saveSf, loadSf };
}
