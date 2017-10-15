import {homepage} from '../package.json';

const m = homepage.match(/^(https?:\/\/[^/]+)(.*)/);

const Paths = {
  home: m[1],

  pianoPath: m[2],

  chordPath: '/chord/',

  pianoPrefix(path = '') {
    path = path.replace(/^\//, '');
    return Paths.pianoPath + path;
  },

  chordPrefix(path = '') {
    path = path.replace(/^\//, '');
    return Paths.chordPath + path;
  },
};

export default Paths;
