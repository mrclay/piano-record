import * as C from './constants';

const Ops = {

  encodeOp(op, time) {
    return [
      String.fromCharCode(op[0] + C.ORD_A_UPPER),
      op[1].toString(16),
      Math.round(time).toString(36),
    ].join('');
  },

  decodeOp(token) {
    const command = token[0].charCodeAt(0) - C.ORD_A_UPPER;
    const note = parseInt(token.substr(1, 2), 16);
    const time = parseInt(token.substr(3), 36);
    const op = [command, note];
    return [op, time];
  },

  keyDownOperation(note) {
    const noteInt = parseInt(note, 10);
    return Ops.operationFromMidi([C.MIDI0_NOTE_ON, noteInt, 254]);
  },

  keyUpOperation(note) {
    const noteInt = parseInt(note, 10);
    return Ops.operationFromMidi([C.MIDI0_NOTE_OFF, noteInt, 0]);
  },

  operationFromMidi([op, note, velocity]) {
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

  streamFromOperations(operations) {
    return operations
      .map(el => Ops.encodeOp(el[0], el[1]))
      .join('');
  },

  operationsFromStream(stream) {
    if (!stream) {
      return [];
    }

    const pattern = /[A-Z][a-z0-9]+/g;
    let token;
    let operations = [];

    // eslint-disable-next-line
    while (token = pattern.exec(stream)) {
      const opTime = Ops.decodeOp(token[0]);
      operations.push([opTime[0], opTime[1]]);
    }

    return operations;
  },

  encodeMoreURIComponents(str) {
    return str.replace(
      /[!'()*]/g,
      c => ('%' + c.charCodeAt(0).toString(16))
    );
  },

  fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(
      /[!'()*]/g,
      c => ('%' + c.charCodeAt(0).toString(16))
    );
  },

  encodeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};

export default Ops;
