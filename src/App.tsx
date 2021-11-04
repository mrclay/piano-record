import React, { ComponentType, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  RouteComponentProps,
} from "react-router-dom";

import Paths from "./Paths";

setTimeout(() => {
  import("./pages/ChordPage");
  import("./pages/PianoPage");
}, 1500);

const AsyncChord = lazy(() => import("./pages/ChordPage"));
const AsyncPiano = lazy(() => import("./pages/PianoPage"));

// Key the component on pathname so we destroy it if path changes
function pathKeyedComponent<T extends object>(C: ComponentType<T>) {
  return (props: T & RouteComponentProps) => (
    <Suspense fallback={<>...</>}>
      <C key={props.location.pathname} {...props} />
    </Suspense>
  );
}

const App = () => (
  <Router>
    <div>
      <Switch>
        <Route
          path={Paths.pianoPrefix("/songs/:stream/:title")}
          component={pathKeyedComponent(AsyncPiano)}
        />
        <Route
          path={Paths.pianoPrefix("/songs/:stream")}
          component={pathKeyedComponent(AsyncPiano)}
        />
        <Route
          path={Paths.pianoPrefix("/record/:stream")}
          component={pathKeyedComponent(AsyncPiano)}
        />
        <Route
          path={Paths.pianoPrefix("/record")}
          component={pathKeyedComponent(AsyncPiano)}
        />
        <Route
          path={Paths.pianoPrefix("/")}
          component={pathKeyedComponent(AsyncPiano)}
        />
        <Route
          path={Paths.chordPrefix("/:notes/:title")}
          component={pathKeyedComponent(AsyncChord)}
        />
        <Route
          path={Paths.chordPrefix("/:notes")}
          component={pathKeyedComponent(AsyncChord)}
        />
        <Route
          path={Paths.chordPrefix("/")}
          component={pathKeyedComponent(AsyncChord)}
        />
        <Route
          path="/"
          render={() => {
            return <Redirect to={Paths.pianoPrefix("/")} />;
          }}
        />
      </Switch>
    </div>
  </Router>
);

export default App;
