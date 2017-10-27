import React from 'react';
import ReactDOM from 'react-dom';
import SongsPage from './pages/SongsPage';
import ChordPage from './pages/ChordPage';
import RecordPage from './pages/RecordPage';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import './index.css';
import Paths from './Paths';

const Page = () => (
  <Router>
    <div>
      <Switch>
        <Route path={Paths.pianoPrefix('/songs/:stream/:title')} component={SongsPage} />
        <Route path={Paths.pianoPrefix('/songs/:stream')} component={SongsPage} />
        <Route path={Paths.pianoPrefix('/record')} component={RecordPage} />
        <Route path={Paths.pianoPrefix('/')} component={SongsPage} />
        <Route path={Paths.chordPrefix('/:notes/:title')} component={ChordPage} />
        <Route path={Paths.chordPrefix('/:notes')} component={ChordPage} />
        <Route path={Paths.chordPrefix('/')} component={ChordPage} />
        <Route path='/' render={() => {
          return <Redirect to={Paths.pianoPrefix('/')} />
        }} />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(<Page />, document.getElementById('root'));
