import CircularSet from "./CircularSet";

export interface Degree {
  roman: string;
  scale: number;
  idx: number;
}

export type FlexDegree = Degree | string;

const degreeSet = new CircularSet<Degree>(
  ["I", "II", "III", "IV", "V", "VI", "VII"].map((roman, idx) => ({
    roman,
    scale: idx + 1,
    idx,
  }))
);

export function degreeFromRoman(roman: FlexDegree): Degree {
  if (typeof roman === 'object') {
    return roman;
  }

  const upper = roman.toUpperCase();
  const degree = degreeSet.items.find((el) => el.roman === upper);
  if (!degree) {
    throw new Error(`Invalid degree "${roman}"`);
  }

  return degree;
}
