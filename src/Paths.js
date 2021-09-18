const Paths = {
  home: "http://mrclay.org",

  pianoPath: "/piano/",

  chordPath: "/chord/",

  pianoPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.pianoPath + path;
  },

  chordPrefix(path = "") {
    path = path.replace(/^\//, "");
    return Paths.chordPath + path;
  },
};

export default Paths;
