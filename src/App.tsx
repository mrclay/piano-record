import React, { ComponentType } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  RouteComponentProps,
} from "react-router-dom";

import Paths from "./Paths";
import asyncComponent from "./AsyncComponent";

setTimeout(() => {
  /*eslint no-unused-expressions: "off"*/
  import("./pages/SongsPage");
  import("./pages/ChordPage");
  import("./pages/RecordPage");
}, 1500);

const AsyncSongs = asyncComponent(() => import("./pages/SongsPage"));
const AsyncChord = asyncComponent(() => import("./pages/ChordPage"));
const AsyncRecord = asyncComponent(() => import("./pages/RecordPage"));

// Key the component on pathname so we destroy it if path changes
function pathKeyedComponent<T extends object>(C: ComponentType<T>) {
  return (props: T & RouteComponentProps) => (
    <C key={props.location.pathname} {...props} />
  );
}

const App = () => (
  <Router>
    <div>
      <Switch>
        <Route
          path={Paths.pianoPrefix("/songs/:stream/:title")}
          component={pathKeyedComponent(AsyncSongs)}
        />
        <Route
          path={Paths.pianoPrefix("/songs/:stream")}
          component={pathKeyedComponent(AsyncSongs)}
        />
        <Route
          path={Paths.pianoPrefix("/record")}
          component={pathKeyedComponent(AsyncRecord)}
        />
        <Route
          path={Paths.pianoPrefix("/")}
          component={pathKeyedComponent(AsyncSongs)}
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
