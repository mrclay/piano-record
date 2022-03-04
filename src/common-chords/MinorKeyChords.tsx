import React from "react";
import { ChordSet } from "./ChordSet";
import { Keyed } from "./Intro";
import { getRenderers } from "./renderers";
import { SeventhTeaser } from "./SeventhTeaser";

function MinorKeyChords({ musicKey, offset }: Keyed) {
  const { f, f7, rom, note } = getRenderers(musicKey, offset);

  return (
    <section>
      <ChordSet
        els={[
          f("i m7"),
          f("bIII maj7"),
          f("iv m7"),
          f("v m7"),
          f("bVI maj7"),
          f("bVII 7"),
        ]}
      />

      <p>
        Many minor key songs are made only from the these six{" "}
        <strong>diatonic chords</strong> (built solely with scale tones).
      </p>

      <ChordSet els={[f("V 7", ""), f7("vii dim7", "")]} />

      <p>
        The <strong>dominant</strong> chord ({rom("V")}) is very commonly used
        and was nearly always used instead of {rom("v")} in classical music.
      </p>
      <p>
        The leading-tone diminished chord has three chord tones in common with{" "}
        {note("V")}7, and so has a similar sound.
      </p>

      <ChordSet
        els={[
          f("ii m7", ""),
          f("IV 7", ""),
          f("bII maj7", ""),
          f("bvii m7", ""),
        ]}
      />

      <p>
        These are two <strong>borrowed chords</strong> from the dorian mode, and
        two from the phrygian mode.
      </p>

      <ChordSet els={[f("V/iv 7", ""), f("V/V 7", ""), f7("V/bVI 7", "")]} />

      <p>
        These are <strong>secondary dominants</strong> of the {rom("iv")},{" "}
        {rom("V")}, and {rom("bVI")} chords.
      </p>

      <ChordSet els={[f("ii m7b5", "")]} />

      <p>
        The 2nd diatonic chord is uncommon in pop music, but in classical and
        jazz commonly leads to the {rom("V")}.
      </p>

      <ChordSet els={[f("I 7", ""), f("I maj7", "")]} />

      <p>
        The parallel major tonic is sometimes used not as secondary dominant,
        but just because it sounds surprising but familiar.
      </p>

      <ChordSet els={[f("V + vii", "")]} />

      <p>
        This commonly follows the tonic triad, harmonizing the leading-tone bass
        note while keeping the other tones ({note("biii")} and {note("v")})
        static.
      </p>

      <ChordSet els={[f7("vii/V dim7", ""), f7("vii/iv dim7", "")]} />

      <p>
        These are <strong>secondary leading-tone diminished</strong> chords
        naturally leading to the chords {rom("V")} and {rom("iv")}.
      </p>

      <ChordSet els={[f7("subV/V 7", ""), f7("subV 7", "")]} />

      <p>
        These are <strong>tritone substitutes</strong> for the chords{" "}
        {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
        {rom("i")}. In sheet music you may find the 7th notated as an augmented
        6th.
      </p>

      <ChordSet els={[f7("V 7#9", ""), f7("subV 7b5", "")]} />

      <p>
        Just a couple examples of dominant 7th chords that have been "altered"
        with their 5th and/or 9th chord tones lowered or raised. Commonly done
        in jazz.
      </p>

      <ChordSet els={[f("bI", "")]} />

      <p>
        A borrowed chord from {note("bIII")} minor, the parallel minor mode of
        the relative major. It usually follows the tonic {note("i")}m to provide
        a mysterious change.
      </p>
    </section>
  );
}

export default MinorKeyChords;
