import React from "react";

import { useStore } from "../store";

export default function SongChords() {
  const [songChords] = useStore.songChords();

  return (
   <p>{songChords}</p>
  );
}
