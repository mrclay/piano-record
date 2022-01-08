import React from "react";
import Key from "../music-theory/Key";
import { getRenderers } from "./renderers";
import { SeventhTeaser } from "./SeventhTeaser";

interface CommonChordsProps {
  musicKey: Key;
  sevenths: boolean;
  enableSevenths(): void;
}

function CommonChords({
  enableSevenths,
  musicKey,
  sevenths,
}: CommonChordsProps) {
  const { chords, f, f7, rom } = getRenderers(musicKey, sevenths);

  return (
    <div>
      <h2>
        {chords(
          f("I maj7"),
          f("ii m7"),
          f("iii m7"),
          f("IV maj7"),
          f("V 7"),
          f("vi m7")
        )}
      </h2>
      <p>
        Many major key songs are made only from the first six{" "}
        <strong>diatonic chords</strong> (built solely with scale tones).
      </p>

      <h2>{chords(f7("V/IV 7"), f("V/V 7"), f("V/vi 7"), f("V/ii 7"))}</h2>
      <p>
        These are <strong>secondary dominants</strong> of the {rom("IV")},{" "}
        {rom("V")}, {rom("vi")} and {rom("ii")} chords.
      </p>
      <p>
        The secondary dominant of {rom("iii")}, {f("V/iii").slice(1)}7, is
        pretty rarely used.
      </p>

      <h2>
        {chords(
          f("ii m7b5"),
          f("bIII maj7"),
          f("iv m7"),
          f("v m7"),
          f("bVI maj7"),
          f("bVII 7")
        )}
      </h2>
      <p>
        These are <strong>borrowed chords</strong> from the minor (aeolian)
        mode.
      </p>

      <h2>
        {chords(f7("I 7"), f7("IV 7"), f7("v m"), f7("bVI 7"), f7("bVII 7"))}
      </h2>
      <p>
        These are often used in rock &amp; blues with the 7th notes just for
        color rather than serving a dominant function.
      </p>

      <h2>{chords(f("vii m7b5"))}</h2>
      <p>
        The 7th diatonic chord is far less popular and generally only used for
        leading into {f("III").slice(1)}7.
      </p>

      <h2>{chords(f("I +"), f("V/vi + /#V"))}</h2>
      <p>
        These are often used as passing chords between {f("I").slice(1)} and{" "}
        {f("vi").slice(1)}m to harmonize the note {f("#v").slice(1)}.
      </p>

      <h2>{chords(f7("#i dim7"), f7("#iv dim7"), f7("#v dim7"))}</h2>
      <p>
        These are <strong>secondary leading-tone diminished</strong> chords,
        functioning as {rom("vii")} of the chords {rom("ii")}, {rom("V")}, and{" "}
        {rom("vi")}.
      </p>
      <p>
        {f("#ii").slice(1)}dim7 is sometimes called a "passing-tone" diminished
        7th with {f("ii").slice(1)} passing to {f("iii").slice(1)}
        —or vice versa—but it may be clearer to think of it as an inversion of{" "}
        {f("#iv").slice(1)}dim7.
      </p>

      <SeventhTeaser sevenths={sevenths} enableSevenths={enableSevenths}>
        <h2>{chords(f7("bVII maj7"))}</h2>
        <p>
          This is borrowed from the mixolydian mode due to the presence of the
          note {f("vi").slice(1)}.
        </p>

        <h2>{chords(f7("V 7b9"), f7("vii dim7"))}</h2>
        <p>
          These are from the harmonic minor mode, and usually go to {rom("I")}.
        </p>

        <h2>{chords(f7("iv mMaj7"), f7("bVII 7#11"))}</h2>
        <p>
          The notes {f("bVI").slice(1)} and {f("iii").slice(1)} in these chords
          help evoke the altered mode <em>mixolydian b6</em>, which is basically
          aeolian but with a distinctive major 3rd.
        </p>

        <h2>{chords(f7("subV/V 7"), f7("subV 7"))}</h2>
        <p>
          These are <strong>tritone substitutes</strong> for the chords{" "}
          {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
          {rom("I")}. In sheet music you may find the 7th notated as an
          augmented 6th.
        </p>

        <h2>{chords(f7("bII maj7"))}</h2>
        <p>
          Borrowed from phrygian, {rom("bII")} most often appears following{" "}
          {rom("V/V")}, {rom("ii")}, or {rom("bVI")} and often goes to{" "}
          {rom("I")} or {rom("V")}.
        </p>

        <h2>{chords(f("iii m7b5"), f("v m7b5"), f("vii m7"))}</h2>
        <p>
          These sometimes function as "secondary predominants", appearing before
          secondary dominants {rom("V/ii")}, {rom("V/IV")}, or {rom("V/vi")} (or
          before their equivalent secondary leading-tone diminished chords).
        </p>

        <h2>
          {chords(f("V 7b9"), f("V 7#9"), f("subV 7b5"))}
          <span className="sep"> . </span> etc.
        </h2>
        <p>
          In jazz, dominant 7th chords are often "altered" with their 5th and/or
          9th chord tones lowered or raised. These are just some examples.
        </p>
      </SeventhTeaser>
    </div>
  );
}

export default CommonChords;
