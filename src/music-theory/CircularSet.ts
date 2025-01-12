export function boundModulo(modulo: number, num: number): number {
  if (num < 0) {
    return modulo - boundModulo(modulo, -num);
  }

  return num % modulo;
}

export default class CircularSet<T> {
  public readonly items: readonly T[];

  constructor(items: readonly T[]) {
    this.items = items;
  }

  get(idx: number): T {
    const bound = boundModulo(this.items.length, idx);
    return this.items[bound]!;
  }
}
