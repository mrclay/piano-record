import { useStore } from "../store";
import { availableInstruments, SoundFont } from "../players";

export default function SoundSelector() {
  const [playerSpec, setPlayerSpec] = useStore.playerSpec();
  const [playerLoading] = useStore.playerLoading();
  const { sf, name } = playerSpec;

  return (
    <div style={{ marginTop: "1rem" }}>
      <span className="sound-selectors">
        <label>
          Soundfont{" "}
          <select
            className="form-select"
            value={sf}
            onChange={e => {
              const newSf = e.target.value as SoundFont;
              const available = availableInstruments[newSf];
              if (available?.includes(name)) {
                const newName = available!.includes(name)
                  ? playerSpec.name
                  : available![0];
                setPlayerSpec(prev => ({ ...prev, sf: newSf }));
              } else {
                setPlayerSpec({
                  sf: newSf,
                  name: available![0] || "",
                  midiProgram: 1,
                });
              }
            }}
          >
            {Object.keys(availableInstruments)
              .filter(sf => sf !== SoundFont.Null)
              .map(sf => (
                <option key={sf}>{sf}</option>
              ))}
          </select>
        </label>{" "}
        {playerSpec.sf !== SoundFont.TonePiano && (
          <label>
            Instrument{" "}
            <select
              className="form-select"
              value={name}
              onChange={e => {
                const name = e.target.value;
                const idx = availableInstruments[sf]?.indexOf(name);
                if (typeof idx === "number" && idx !== -1) {
                  setPlayerSpec({ sf, name, midiProgram: idx + 1 });
                }
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
          </label>
        )}
        {playerLoading && (
          <span className="sound-selectors--loading">Loading...</span>
        )}
      </span>
    </div>
  );
}

export interface UseSfStorage {
  saveSf(params?: URLSearchParams): URLSearchParams;
}

export function useSfStorage(): UseSfStorage {
  const [playerSpec] = useStore.playerSpec();

  function saveSf(params = new URLSearchParams()) {
    if (playerSpec.sf === SoundFont.TonePiano) {
      params.delete("sf");
    } else {
      params.set("sf", `${playerSpec.sf}.${playerSpec.name}`);
    }
    return params;
  }

  return { saveSf };
}
