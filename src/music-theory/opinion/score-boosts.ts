import Key from "../Key";
import { ScoredChord, ScoringAttribute } from "./scoring";

export interface ScoreBoost {
  readonly boost: number;
  readonly rationale: string;
  readonly disabled?: true;
}

export const Boosts = {
  tonicFirst: {
    boost: 1,
    rationale: "Starts with tonic chord",
  },
  tonicLast: {
    boost: 1,
    rationale: "Ends with tonic chord",
    disabled: true,
  },
  noTonic: {
    boost: -5,
    rationale: "Missing tonic chord",
  },
  isTonic: {
    boost: 1,
    rationale: "Tonic",
  },
  matched7th: {
    boost: 1,
    rationale: "Same 7th quality",
  },
  nonMatch: {
    boost: -5,
    rationale: "Not common in the key",
  },
  hasDiatonicOrDominant: {
    boost: 1,
    rationale: "Has diatonic chord or V",
  },
} satisfies Record<string, ScoreBoost>;

const boostIsEnabled = (boost: ScoreBoost) => !boost.disabled;

export function calculateChordBoosts(attrs: ScoringAttribute[]): ScoreBoost[] {
  const ret: ScoreBoost[] = [];

  if (attrs.includes("tonic")) {
    ret.push(Boosts.isTonic);
  }

  if (attrs.includes("matches7th")) {
    ret.push(Boosts.matched7th);
  }

  return ret.filter(boostIsEnabled);
}

export function calculateProgressionBoosts(
  key: Key,
  progression: Array<ScoredChord>
): ScoreBoost[] {
  const ret: ScoreBoost[] = [];

  const first = progression[0];
  if (first && first.type === "match" && first.attrs.includes("tonic")) {
    ret.push(Boosts.tonicFirst);
  }

  const last = progression[progression.length - 1];
  if (last && last.type === "match" && last.attrs.includes("tonic")) {
    ret.push(Boosts.tonicLast);
  }

  if (
    !progression.some(
      chord => chord.type === "match" && chord.attrs.includes("tonic")
    )
  ) {
    ret.push(Boosts.noTonic);
  }

  if (
    progression.some(chord => {
      if (chord.type !== "match") {
        return false;
      }
      return (
        chord.attrs.includes("diatonic") || chord.attrs.includes("dominant")
      );
    })
  ) {
    ret.push(Boosts.hasDiatonicOrDominant);
  }

  ret.sort((a, b) => {
    return b.boost - a.boost;
  });

  return ret.filter(boostIsEnabled);
}

export function displayDelta({ boost }: ScoreBoost) {
  return boost < 0 ? boost + "" : `+${boost}`;
}
