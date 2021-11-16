import React, { ComponentType, lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import Paths from "./Paths";

setTimeout(() => {
  import("./pages/ChordPage");
  import("./pages/PianoPage");
  import("./pages/SequencePage");
}, 1500);

const AsyncChord = lazy(() => import("./pages/ChordPage"));
const AsyncPiano = lazy(() => import("./pages/PianoPage"));
const AsyncSequence = lazy(() => import("./pages/SequencePage"));

// Key the component on pathname so we destroy it if path changes
function PathKeyedComponent(C: ComponentType) {
  const location = useLocation();
  return (
    <Suspense fallback={<>...</>}>
      <C key={location.pathname} />
    </Suspense>
  );
}

const App = () => (
  <div>
    <Routes>
      <Route
        path={Paths.pianoPrefix("/songs/:stream/:title")}
        element={PathKeyedComponent(AsyncPiano)}
      />
      <Route
        path={Paths.pianoPrefix("/songs/:stream")}
        element={PathKeyedComponent(AsyncPiano)}
      />
      <Route
        path={Paths.pianoPrefix("/record/:stream")}
        element={PathKeyedComponent(AsyncPiano)}
      />
      <Route
        path={Paths.pianoPrefix("/record")}
        element={PathKeyedComponent(AsyncPiano)}
      />
      <Route
        path={Paths.pianoPrefix("/")}
        element={PathKeyedComponent(AsyncPiano)}
      />
      <Route
        path={Paths.chordPrefix("/:notes/:title")}
        element={PathKeyedComponent(AsyncChord)}
      />
      <Route
        path={Paths.chordPrefix("/:notes")}
        element={PathKeyedComponent(AsyncChord)}
      />
      <Route
        path={Paths.chordPrefix("/")}
        element={PathKeyedComponent(AsyncChord)}
      />
      <Route
        path={Paths.sequencePrefix("/songs/:stream")}
        element={PathKeyedComponent(AsyncSequence)}
      />
      <Route
        path={Paths.sequencePrefix("/")}
        element={PathKeyedComponent(AsyncSequence)}
      />
      <Route path="/" element={<Navigate to={Paths.pianoPrefix("/")} />} />
    </Routes>
  </div>
);

export default App;
