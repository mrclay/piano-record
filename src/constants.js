
export const SOURCE_URL = 'https://github.com/mrclay/piano-record';
export const RAWGIT_URL = 'http://mrclay.org/piano/media/';
export const RANGE = [36, 96];
export const VELOCITIES = 1;
export const USE_RELEASE = false;
export const TIME_RESOLUTION_DIVISOR = 4;
export const ORD_A_UPPER = 'A'.charCodeAt(0);

export const STOPPED = 'stopped';
export const RECORDING = 'recording';
export const PLAYING = 'playing';

export const OP_PEDAL_DOWN = 0;
export const OP_PEDAL_UP = 1;
export const OP_NOTE_DOWN = 2;
export const OP_NOTE_UP = 3;

// http://www.midimountain.com/midi/midi_status.htm
export const MIDI0_NOTE_ON = 144;
export const MIDI0_NOTE_OFF = 128;
export const MIDI0_PEDAL = 176;
export const MIDI0_L1 = 252; // L1 button on Edirol GM2
export const MIDI0_TUNE = 176; // TODO use for metronome?

export const MIDI1_PEDAL = 64;
export const MIDI1_TUNE = 10;

export const MIDI2_RELEASE_VELOCITY = 0;

export const DEFAULT_TITLE = 'Untitled';
