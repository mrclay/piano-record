import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import './index.css';
import Paths from './Paths';
import asyncComponent from './AsyncComponent';

function myAsyncComponent(load) {
  return asyncComponent(() => {
    const component = load();

    // lazy load the rest
    setTimeout(() => {
      import('./pages/SongsPage');
      import('./pages/ChordPage');
      import('./pages/RecordPage');
    }, 1500);

    return component;
  });
}

const AsyncSongs = myAsyncComponent(() => import('./pages/SongsPage'));
const AsyncChord = myAsyncComponent(() => import('./pages/ChordPage'));
const AsyncRecord = myAsyncComponent(() => import('./pages/RecordPage'));

const Page = () => (
  <Router>
    <div>
      <Switch>
        <Route
          path={Paths.pianoPrefix('/songs/:stream/:title')}
          component={AsyncSongs}
        />
        <Route
          path={Paths.pianoPrefix('/songs/:stream')}
          component={AsyncSongs}
        />
        <Route
          path={Paths.pianoPrefix('/record')}
          component={AsyncRecord}
        />
        <Route
          path={Paths.pianoPrefix('/')}
          component={AsyncSongs}
        />
        <Route
          path={Paths.chordPrefix('/:notes/:title')}
          component={AsyncChord}
        />
        <Route
          path={Paths.chordPrefix('/:notes')}
          component={AsyncChord}
        />
        <Route
          path={Paths.chordPrefix('/')}
          component={AsyncChord}
        />
        <Route
          path='/'
          render={() => {
            return <Redirect to={Paths.pianoPrefix('/')} />
          }}
        />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(<Page />, document.getElementById('root'));
