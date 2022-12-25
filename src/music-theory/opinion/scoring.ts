import Key from "../Key";
import { Chord, getChordPitches, parseChord } from "../Chord";
import { Char, majorKeys, minorKeys, ThirdQuality } from "../constants";
import {
  chordIsDiminished,
  ChordTypes,
  getChordTypeQuality,
} from "../ChordType";
import { commonChords } from "./chord-usage";
import {
  Boosts,
  calculateChordBoosts,
  calculateProgressionBoosts,
  ScoreBoost,
} from "./score-boosts";

// Notes about the chord that may affect scoring later.
export type ScoringAttribute = "tonic" | "matches7th";

interface MatchedChord {
  type: "match";
  // Chord given by user
  given: Chord;
  boosts: ScoreBoost[];
  // Chord from our list that matched this
  chordInKey: Chord;
  // Roman numeral to display
  roman: string;
  usageScore: number;
  attrs: ScoringAttribute[];
}

interface NonMatchedChord {
  type: "non-match";
  // Chord given by user
  given: Chord;
  boosts: ScoreBoost[];
  usageScore: 0;
}

export type ScoredChord = MatchedChord | NonMatchedChord;

// Score a single chord based on usage within a key.
// E.g. In G major, Cm is somewhat common, Abm not at all.
function scoreChord(key: Key, given: Chord): ScoredChord {
  const givenPitches = getChordPitches(given);

  const knownChords =
    key.getQuality() === ThirdQuality.MAJOR
      ? commonChords.inMajor
      : commonChords.inMinor;

  // Used so "VI" always returns major 6th, even in minor keys
  const rootFinderKey = Key.major(key.getTonicNote());

  const nonMatch: NonMatchedChord = {
    type: "non-match",
    given,
    usageScore: 0,
    boosts: [Boosts.nonMatch],
  };

  const candidates: MatchedChord[] = Object.entries(knownChords)
    .map(([name, usageScore]) => {
      let [roman, type] = name.split(" ");
      const root = rootFinderKey.getNoteFromRoman(roman).toString();
      const chordInKey = parseChord(`${root}${type}`);
      if (!chordInKey) {
        throw new Error(`Cannot parse chord type: ${type}`);
      }

      const pitches = getChordPitches(chordInKey);

      if (
        chordInKey.type === ChordTypes.dim7 &&
        given.type === ChordTypes.dim7
      ) {
        // Special case: Since these are symmetrical, assume that user may
        // have given an incorrect root, so let's just bypass the triad check.
      } else {
        if (givenPitches.triad !== pitches.triad) {
          // Not same triad.
          return nonMatch;
        }
      }

      if (
        givenPitches.seventh &&
        pitches.seventh &&
        givenPitches.seventh !== pitches.seventh
      ) {
        // Has a 7th that doesn't match, so this is not the same chord.
        return nonMatch;
      }

      const attrs: ScoringAttribute[] = [];

      if (
        chordInKey.root === key.getTonicNote() &&
        getChordTypeQuality(chordInKey.type) === key.quality
      ) {
        attrs.push("tonic");
      }
      if (givenPitches.seventh) {
        attrs.push("matches7th");
      }

      // Add dim symbol and in right place
      if (chordIsDiminished(given.type) && !roman.includes(Char.DIM)) {
        if (roman === "#iv") {
          // Special case. User probably gave a dim triad that matched m7b5
          roman = "vii/V";
        }
        const parts = roman.split("/");
        parts[0] += Char.DIM;
        roman = parts.join("/");
      }

      const ret: MatchedChord = {
        type: "match",
        given,
        chordInKey,
        usageScore,
        boosts: calculateChordBoosts(attrs),
        roman,
        attrs,
      };
      return ret;
    })
    // Keep only matched chords
    .filter((el): el is MatchedChord => el.type === "match");

  // return top score
  candidates.sort((a, b) => {
    if (a.usageScore === b.usageScore) {
      return 0;
    }
    return a.usageScore < b.usageScore ? 1 : -1;
  });
  const topCandidate = candidates[0];

  return topCandidate || nonMatch;
}

// Set a Key here to limit scoring
const DEBUG_KEY: Key | null = null;

const allKeys: Key[] = DEBUG_KEY
  ? [DEBUG_KEY]
  : [
      ...majorKeys.map(name => Key.major(name)),
      ...minorKeys.map(name => Key.minor(name)),
    ];

const sum = (...args: number[]) => args.reduce((acc, curr) => acc + curr, 0);

interface BoostCollection {
  byChord: Array<{
    chord: string;
    boosts: ScoreBoost[];
  }>;
  overall: ScoreBoost[];
}

// Score the progression in every key, sorted highest score first.
export const scoreProgression = (chords: Chord[]) => {
  return allKeys
    .map(key => {
      const progression = chords.map((chord, idx) => scoreChord(key, chord));

      // Scores with chord-specific boosts added in
      const chordScores = progression.map(chord => {
        return chord.usageScore + sum(...chord.boosts.map(el => el.boost));
      });

      const boosts: BoostCollection = {
        byChord: progression
          .filter(
            (item): item is MatchedChord =>
              item.boosts.length > 0 && item.type === "match"
          )
          .map(item => ({
            chord:
              item.chordInKey.root.toString() + item.chordInKey.type.symbol,
            boosts: item.boosts,
          })),
        overall: calculateProgressionBoosts(key, progression),
      };

      const progressionBoost = sum(...boosts.overall.map(el => el.boost));
      const total = sum(progressionBoost, ...chordScores);

      let breakdown = chordScores.join(" + ");
      if (progressionBoost) {
        breakdown += ` + ${progressionBoost} boost`;
      }

      return {
        key,
        total,
        breakdown,
        progression,
        boosts,
      };
    })
    .sort((a, b) => {
      if (a.total === b.total) {
        return 0;
      }
      return a.total > b.total ? -1 : 1;
    });
};
