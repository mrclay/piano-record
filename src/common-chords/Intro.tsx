import React, { FC } from "react";
import Key from "../music-theory/Key";

export interface Keyed {
  musicKey: Key;
  offset: number;
}

export const Intro: FC<Keyed> = ({ musicKey }) => (
  <>
    <p>
      This is a non-exhaustive roundup of chords songwriters often employ in{" "}
      {musicKey.getQuality()} keys.
    </p>
    <p>
      If you usually think of a key as having <i>seven chords</i>, for writing
      purposes I encourage you to add these to your collection and get to know
      the sound of them within the key. Consider them ready-for-use while
      writing in {musicKey + ""}.
    </p>
  </>
);
