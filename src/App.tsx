import React, { ComponentType, lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import Paths from "./Paths";
import { useAds } from "./ui/Ads";
import { useRootSoundManager } from "./useRootSoundManager";

const AsyncChord = lazy(() => import("./pages/ChordPage"));
const AsyncPiano = lazy(() => import("./pages/PianoPage"));
const AsyncSequence = lazy(() => import("./pages/SequencePage"));
const AsyncCommonChords = lazy(() => import("./pages/CommonChordsPage"));
const AsyncGuessKey = lazy(() => import("./pages/GuessKeyPage"));

// Key the component on pathname so we destroy it if path changes
function PathKeyedComponent(C: ComponentType) {
  const location = useLocation();
  return (
    <Suspense fallback={<>...</>}>
      <C key={location.pathname} />
    </Suspense>
  );
}

const App = () => {
  useAds();
  useRootSoundManager();

  return (
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
          element={<Navigate to={Paths.pianoPrefix("/record")} />}
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
        <Route
          path={Paths.commonChordsPrefix("/:urlKey")}
          element={PathKeyedComponent(AsyncCommonChords)}
        />
        <Route
          path={Paths.commonChordsPrefix()}
          element={<Navigate to={Paths.commonChordsPrefix("/C-major")} />}
        />
        <Route
          path={Paths.guessKeyPrefix("/")}
          element={PathKeyedComponent(AsyncGuessKey)}
        />
        <Route path="/" element={<Navigate to={Paths.pianoPrefix("/")} />} />
      </Routes>
    </div>
  );
};

export default App;
