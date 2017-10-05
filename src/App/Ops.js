import * as C from './constants';

const Ops = {

  keyForNote(note) {
    return 'k' + note;
  },

  noteForKey(key) {
    return parseInt(key.substr(1), 10);
  },

  encodeOp(op, time) {
    return [
      String.fromCharCode(op[0] + C.ORD_A_UPPER),
      op[1].toString(16),
      Math.round(time).toString(36)
    ].join('');
  },

  decodeOp(token) {
    const command = token[0].charCodeAt(0) - C.ORD_A_UPPER;
    const note = parseInt(token.substr(1, 2), 16);
    const time = parseInt(token.substr(3), 36);
    const op = [command, note];
    return [op, time];
  },

  operationFromMidi(data) {
    const op = data[0];
    const note = data[1];
    const velocity = data[2];

    if (op === C.MIDI0_PEDAL && note === C.MIDI1_PEDAL) {
      return (velocity > 0) ? [C.OP_PEDAL_DOWN, 0] : [C.OP_PEDAL_UP, 0];

    } else if (op === C.MIDI0_NOTE_OFF || velocity === C.MIDI2_RELEASE_VELOCITY) {
      if (note >= C.RANGE[0] && note <= C.RANGE[1]) {
        return [C.OP_NOTE_UP, note];
      }

    } else if (op === C.MIDI0_NOTE_ON) {
      if (note >= C.RANGE[0] && note <= C.RANGE[1]) {
        return [C.OP_NOTE_DOWN, note];
      }
    }
  },

  getHash(operations, title) {
    const encoded = operations.map((el) => {
      return Ops.encodeOp(el[0], el[1]);
    }).join('');

    let hash = '#s=' + encoded;
    if (title) {
      hash += '&t=' + encodeURIComponent(title);
    }

    return hash;
  }
};

export default Ops;
