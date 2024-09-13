import { useStore } from "../store";
import React, { CSSProperties, useEffect, useState } from "react";
import Keyboard from "../ui/Keyboard";
import PianoSpeed from "../ui/PianoSpeed";
import SongChords from "../ui/SongChords";

interface ChordSetKeyboardProps {
  close(): void;
}

export function ChordSetKeyboard({ close }: ChordSetKeyboardProps) {
  const [piano] = useStore.piano();
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const cc = document.querySelector<HTMLDivElement>(".CC");
    if (cc) {
      const margin = -cc.getBoundingClientRect().left;
      setStyle({
        marginLeft: `${margin}px`,
        marginRight: `${margin}px`,
      });
    }
  }, [piano]);

  return (
    <div style={style} className="mt-2 mb-5">
      <div
        className="d-flex align-items-center my-0 mx-auto mt-2 mb-2 ps-3"
        style={{ width: "1246px" }}
      >
        <button type="button" className="btn btn-outline-light" onClick={close}>
          Close <i className="fa fa-times" aria-hidden="true" />
        </button>
        <SongChords />
      </div>
      <Keyboard piano={piano} />
      <div
        className="d-flex align-items-center my-0 mx-auto mt-2"
        style={{ width: "1246px" }}
      >
        <PianoSpeed />
      </div>
    </div>
  );
}
