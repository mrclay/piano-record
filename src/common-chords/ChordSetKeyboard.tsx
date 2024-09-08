import { useStore } from "../store";
import React, { CSSProperties, useEffect, useState } from "react";
import { ActiveKeys, PianoListener } from "../Piano";
import Keyboard from "../ui/Keyboard";
import PianoSpeed from "../ui/PianoSpeed";
import SongChords from "../ui/SongChords";

interface ChordSetKeyboardProps {
  close(): void;
}

export function ChordSetKeyboard({ close }: ChordSetKeyboardProps) {
  const [piano] = useStore.piano();
  const [activeKeys, setActiveKeys] = useState<ActiveKeys>(new Set());
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const keysListener: PianoListener<"activeKeysChange"> = activeKeys => {
      setActiveKeys(activeKeys);
    };
    piano.addEventListener("activeKeysChange", keysListener);

    const cc = document.querySelector<HTMLDivElement>(".CC");
    if (cc) {
      const margin = -cc.getBoundingClientRect().left;
      setStyle({
        marginLeft: `${margin}px`,
        marginRight: `${margin}px`,
      });
    }

    return () => piano.removeEventListener("activeKeysChange", keysListener);
  }, [piano]);

  return (
    <div style={style} className="my-5">
      <Keyboard piano={piano} />
      <div
        className="d-flex align-items-center my-0 mx-auto mt-2"
        style={{ width: "1246px" }}
      >
        <div>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={close}
          >
            Close <i className="fa fa-times" aria-hidden="true" />
          </button>
        </div>
        <PianoSpeed /> <SongChords />
      </div>
    </div>
  );
}
