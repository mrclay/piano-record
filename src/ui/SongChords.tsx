import React from "react";

import { useStore } from "../store";

export default function SongChords() {
  const [songChords] = useStore.songChords();

  return <p className="m-0 ms-4">{songChords}</p>;
}
