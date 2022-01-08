const Paths = {
  home: "http://mrclay.org",

  pianoPath: "/piano/",
  chordPath: "/chord/",
  sequencePath: "/sequence/",
  commonChordsPath: "/common-chords/",

  pianoPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.pianoPath + path;
  },

  chordPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.chordPath + path;
  },

  commonChordsPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.commonChordsPath + path;
  },

  sequencePrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.sequencePath + path;
  },
};

export default Paths;
