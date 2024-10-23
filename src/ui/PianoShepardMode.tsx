import React, { useEffect, useState } from "react";
import Piano from "../Piano";

interface PianoShepardModeProps {
  piano: Piano;
}

// Unused
export default function PianoShepardMode({ piano }: PianoShepardModeProps) {
  const [shepardMode, setShepardMode] = useState(false);

  useEffect(() => {
    piano.shepardMode = shepardMode;
  }, [shepardMode]);

  return (
    <div className="form-check" style={{ marginTop: "1rem" }}>
      <input
        type="checkbox"
        className="form-check-input"
        checked={shepardMode}
        onChange={() => setShepardMode(val => !val)}
        id="PianoShepardMode"
      />
      <label className="form-check-label" htmlFor="PianoShepardMode">
        Shepard tones mode
      </label>
    </div>
  );
}
