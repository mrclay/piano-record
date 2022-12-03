import { NavigateFunction } from "react-router-dom";

import { Command } from "./Ops";

let samplesUrl = "//mrclay.org/piano/media/";
if (process.env.NODE_ENV !== "production") {
  samplesUrl = "/media/";
}
export const SAMPLES_URL = samplesUrl;

export const RANGE = [36, 96];
export const TIME_RESOLUTION_DIVISOR = 4;
export const ORD_A_UPPER = "A".charCodeAt(0);

export const OP_PEDAL_DOWN: Command = 0;
export const OP_PEDAL_UP: Command = 1;
export const OP_NOTE_DOWN: Command = 2;
export const OP_NOTE_UP: Command = 3;

// http://www.midimountain.com/midi/midi_status.htm
export const MIDI0_NOTE_ON = 144;
export const MIDI0_NOTE_OFF = 128;
export const MIDI0_PEDAL = 176;
export const MIDI0_L1 = 252; // L1 button on Edirol GM2
export const MIDI0_TUNE = 176; // TODO use for metronome?

export const MIDI1_PEDAL = 64;

export const MIDI2_RELEASE_VELOCITY = 0;

export const DEFAULT_TITLE = "Untitled";

export interface RouteComponentProps<T extends object = {}> {
  navigate: NavigateFunction;
  params: T;
  pathname: string;
  transpose: string;
}

/**
 * 1. Play us a song!!!
 *  [X]
 *  [I'm done]  [Start over]
 *  | applause  | record scratch
 *
 * 2. (Playback)
 *  [Replay jam]  [Fix the timing]  [Share]
 *
 * 3. Press letter keys to replay notes in order
 *  [Nailed it]  [Try again]  [Start over]
 */
