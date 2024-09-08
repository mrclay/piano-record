import React, { useEffect } from "react";

import { useStore } from "../store";
import { RecorderState } from "../Recorder";

export default function PianoSpeed() {
  const [speed, setSpeed] = useStore.pianoSpeed();
  const [recorder] = useStore.recorder();

  useEffect(() => {
    if (recorder.speed !== speed / 100) {
      recorder.speed = speed / 100;

      console.log(recorder.getState());

      if (recorder.getState() === RecorderState.playing) {
        recorder.stop();
        recorder.play();
      }
    }
  }, [speed, recorder]);

  return (
    <div className="btn-group" role="group">
      {[50, 75, 100].map(perc => (
        <button
          key={perc + ""}
          title={`Set speed to ${perc}%`}
          type="button"
          className={`btn btn-dark ${perc === speed ? "active" : ""}`}
          onClick={() => setSpeed(perc)}
        >
          {perc}%
        </button>
      ))}
    </div>
  );
}
