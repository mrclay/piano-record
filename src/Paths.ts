const Paths = {
  home: "http://mrclay.org",

  pianoPath: "/piano/",
  chordPath: "/chord/",
  sequencePath: "/sequence/",
  commonChordsPath: "/common-chords/",
  guessKeyPath: "/guess-the-key/",

  getSamplesUrl() {
    const origin = location.origin;
    if (origin.includes("localhost")) {
      return "/media";
    }

    return origin + "/piano/media";
  },

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

  guessKeyPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.guessKeyPath + path;
  },
};

export default Paths;
