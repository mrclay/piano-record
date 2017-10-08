import {homepage} from '../package.json';

const m = homepage.match(/^(https?:\/\/[^/]+)(.*)/);

const Paths = {
  base: m[2],

  prefix(path) {
    path = path.replace(/^\//, '');
    return m[2] + path;
  },

  url(path) {
    path = path.replace(/^\//, '');
    return m[1] + m[2] + path;
  }
};

export default Paths;
