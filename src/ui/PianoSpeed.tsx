import React from "react";

import { useStore } from "../store";

export default function PianoSpeed() {
  const [speed, setSpeed] = useStore.pianoSpeed();

  return (
    <div className="btn-group" role="group">
      {[50, 75, 100].map(perc => (
        <button
          key={perc + ""}
          title={`Set speed to ${perc}%`}
          type="button"
          className={`btn btn-default ${perc === speed ? "active" : ""}`}
          onClick={() => setSpeed(perc)}
        >
          {perc}%
        </button>
      ))}
    </div>
  );
}
