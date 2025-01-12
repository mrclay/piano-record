import CircularSet from "./CircularSet";
import Note, { FlexNote } from "./Note";
import { degreeFromRoman, FlexDegree } from "./Degree";
import { diatonicOffsets, readAccidentalsMap, ThirdQuality } from "./constants";
import { getInterval } from "./Interval";

const majorCache = new Map<Note, Key>();
const minorCache = new Map<Note, Key>();

export default class Key extends CircularSet<Note> {
  readonly quality: ThirdQuality;

  constructor(notes: readonly Note[]) {
    super(notes);

    const third = getInterval(notes[0]!, notes[2]!);
    this.quality =
      third.deltaSemitones === 4 ? ThirdQuality.MAJOR : ThirdQuality.MINOR;
  }

  static create(tonic: FlexNote, degree: FlexDegree): Key {
    const rawTonic = Note.fromName(tonic);
    const degreeIdx = degreeFromRoman(degree).idx;
    const intervals = [...diatonicOffsets, ...diatonicOffsets].slice(
      degreeIdx,
      degreeIdx + 6,
    );
    const scale = [rawTonic];
    let last = rawTonic;
    intervals.forEach(interval => {
      last = last.getNextNote(interval);
      scale.push(last);
    });

    return new Key(scale);
  }

  static major(tonic: FlexNote): Key {
    const degree = "I";
    const keyCache = majorCache;

    const rawTonic = Note.fromName(tonic);
    let cached = keyCache.get(rawTonic);
    if (!cached) {
      cached = Key.create(tonic, degree);
      keyCache.set(rawTonic, cached);
    }
    return cached;
  }

  static minor(tonic: FlexNote): Key {
    const degree = "VI";
    const keyCache = minorCache;

    const rawTonic = Note.fromName(tonic);
    let cached = keyCache.get(rawTonic);
    if (!cached) {
      cached = Key.create(tonic, degree);
      keyCache.set(rawTonic, cached);
    }
    return cached;
  }

  getTonicNote(): Note {
    return this.items[0]!;
  }

  getNoteFromRoman(expression: string): Note {
    // Handle secondaries
    const pieces = expression.split("/");
    if (pieces.length > 1) {
      const target = this.getNoteFromRoman(pieces.pop() as string);
      return Key.major(target).getNoteFromRoman(pieces.join("/"));
    }

    if (/^(subV|Vsub)$/i.test(expression)) {
      return this.getNoteFromRoman("bII");
    }

    if (/^(It|Fr|Ger)?\+6$/i.test(expression)) {
      return this.getNoteFromRoman("bVI");
    }

    const m = expression.match(/^([#♯b♭])?([IViv]{1,3})/);
    if (!m) {
      throw new Error(`Could not parse degree "${expression}"`);
    }
    const [, accidental = "", roman = ""] = m;
    const degree = degreeFromRoman(roman);
    const note = this.items[degree.idx]!;

    return new Note(
      note.pitchClass,
      note.sharps + (readAccidentalsMap[accidental] || 0),
    );
  }

  withAltered(degree: FlexDegree, sharps: number): Key {
    const rawDegree = degreeFromRoman(degree);
    if (rawDegree.idx === 0) {
      throw new Error("You can't alter the tonic, silly");
    }
    const items = this.items.slice();
    const note = items[rawDegree.idx]!;
    items[rawDegree.idx] = new Note(note.pitchClass, note.sharps + sharps);

    return new Key(items);
  }

  getQuality(): ThirdQuality {
    return this.quality;
  }

  getNoteNames(): string[] {
    return this.items.map(note => note + "");
  }

  hasChromatic(chromatic: number): boolean {
    return this.items.some(note => note.getChromatic() === chromatic);
  }

  override toString(unicode = false) {
    return `${this.getTonicNote().toString(unicode)} ${this.quality}`;
  }
}
