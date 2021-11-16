const Paths = {
  home: "http://mrclay.org",

  pianoPath: "/piano/",
  chordPath: "/chord/",
  sequencePath: "/sequence/",

  pianoPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.pianoPath + path;
  },

  chordPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.chordPath + path;
  },

  sequencePrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.sequencePath + path;
  },
};

export default Paths;
