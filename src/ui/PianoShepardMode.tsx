import React, { useEffect, useState } from "react";
import Piano from "../Piano";

interface PianoShepardModeProps {
  piano: Piano;
}

export default function PianoShepardMode({ piano }: PianoShepardModeProps) {
  const [shepardMode, setShepardMode] = useState(false);

  useEffect(() => {
    piano.shepardMode = shepardMode;
  }, [shepardMode]);

  return (
    <div style={{ marginTop: "1rem" }}>
      <label>
        <input
          type="checkbox"
          checked={shepardMode}
          onChange={() => setShepardMode(val => !val)}
        />{" "}
        Shepard tones mode
      </label>
    </div>
  );
}
