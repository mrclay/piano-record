import React from 'react';
import ReactDOM from 'react-dom';
import SongsPage from './pages/SongsPage';
import RecordPage from './pages/RecordPage';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import './index.css';
import Paths from './Paths';

function Index({location}) {
  if (location.hash) {
    // legacy URLs
    const m = location.hash.match(/s=(\w+)(?:&t=(.*))?/);
    if (m) {
      const path = m[2] ? `/songs/${m[1]}/${m[2]}` : `/songs/${m[1]}`;
      return (
        <Redirect to={Paths.prefix(path)} />
      );
    }
  }

  return (
    <Redirect to={Paths.prefix('/record')} />
  );
}

const Page = () => (
  <Router>
    <div>
      <Switch>
        <Route path={Paths.prefix('/songs/:stream/:title')} component={SongsPage} />
        <Route path={Paths.prefix('/songs/:stream')} component={SongsPage} />
        <Route path={Paths.prefix('/record')} component={RecordPage} />
        <Route path='*' render={Index} />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(<Page />, document.getElementById('root'));
