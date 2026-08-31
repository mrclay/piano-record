import { type PlayerSpec, updateParamsByPlayerSpec, useStore } from "../store";
import { availableInstruments, SoundFont, type TSoundFont } from "../players";

interface SoundSelectorProps {
  onChange?: (playerSpec: PlayerSpec) => void;
}

export default function SoundSelector({ onChange }: SoundSelectorProps) {
  const [playerSpec, setPlayerSpec] = useStore.playerSpec();
  const [playerLoading] = useStore.playerLoading();
  const { sf, name, cents } = playerSpec;
  const midiOffsetOptions = [
    10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10,
  ].map(x => x * 5);

  return (
    <div style={{ marginTop: "1rem" }}>
      <span className="sound-selectors">
        <label>
          Soundfont{" "}
          <select
            className="form-select"
            value={sf}
            onChange={e => {
              const newSf = e.target.value as TSoundFont;
              const available = availableInstruments[newSf];
              let newSpec = { ...playerSpec };
              if (available?.includes(name)) {
                newSpec.sf = newSf;
              } else {
                Object.assign(newSpec, {
                  sf: newSf,
                  name: available![0] || "",
                  midiProgram: 1,
                });
              }

              if (onChange) {
                onChange(newSpec);
              } else {
                setPlayerSpec(newSpec);
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
                  const newSpec = {
                    ...playerSpec,
                    sf,
                    name,
                    midiProgram: idx + 1,
                  };
                  if (onChange) {
                    onChange(newSpec);
                  } else {
                    setPlayerSpec(newSpec);
                  }
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
        <label>
          Fine tune{""}
          <select
            className="form-select"
            value={cents}
            onChange={e => {
              const newSpec = { ...playerSpec, cents: Number(e.target.value) };
              if (onChange) {
                onChange(newSpec);
              } else {
                setPlayerSpec(newSpec);
              }
            }}
          >
            {midiOffsetOptions.map(option => (
              <option key={option} value={option}>
                {option === 0 && "A440"}
                {option > 0 && `+${option} cents`}
                {option < 0 && `${option} cents`}
              </option>
            ))}
          </select>
        </label>
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
    return updateParamsByPlayerSpec(params, playerSpec);
  }

  return { saveSf };
}
