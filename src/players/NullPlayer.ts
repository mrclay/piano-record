import type { Playable } from "./index";

const noop = () => 0;

export default class NullPlayer implements Playable {
  keyDown = noop;
  keyUp = noop;
  pedalDown = noop;
  pedalUp = noop;
  stopAll = noop;
}
