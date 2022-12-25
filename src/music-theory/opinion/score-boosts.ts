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
    boost: -1,
    rationale: "Missing tonic chord",
  },
  matched7th: {
    boost: 1,
    rationale: "7th chord match",
  },
  nonMatch: {
    boost: -5,
    rationale: "Chord is not common in the key",
  },
} satisfies Record<string, ScoreBoost>;

const boostIsEnabled = (boost: ScoreBoost) => !boost.disabled;

export function calculateChordBoosts(attrs: ScoringAttribute[]): ScoreBoost[] {
  const ret: ScoreBoost[] = [];

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

  return ret.filter(boostIsEnabled);
}

export function displayDelta({ boost }: ScoreBoost) {
  return boost < 0 ? boost + "" : `+${boost}`;
}
