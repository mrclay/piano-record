import React from "react";

import { useStore } from "../store";

export default function MicroTuning() {
  const [value, setValue] = useStore.microtone();

  return (
    <div className="btn-group" role="group">
      <input
        type="range"
        min="-10"
        max="10"
        value={value * 20}
        onChange={e => setValue(Number(e.target.value) / 20)}
      />
    </div>
  );
}
