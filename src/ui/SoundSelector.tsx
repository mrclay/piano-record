import { PlayerSpec, useStore } from "../store";
import { availableInstruments, SoundFont } from "../players";
import { InstrumentName } from "soundfont-player";
import { useRef } from "react";

export default function SoundSelector() {
  const [playerSpec, setPlayerSpec] = useStore.playerSpec();
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
      <label>
        Instrument{" "}
        <select
          className="form-control"
          value={name}
          onChange={e => {
            const name = e.target.value as InstrumentName;
            update({ sf, name });
          }}
        >
          {availableInstruments[sf].map(name => (
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
            const available: InstrumentName[] = availableInstruments[newSf];
            const newName = available.includes(name)
              ? playerSpec.name
              : available[0];
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
