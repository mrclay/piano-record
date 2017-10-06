import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Route, Redirect, Link} from 'react-router-dom';

function Playback(props) {
  const location = window.location;
  if (!location.hash) {
    return (
      <Redirect to={{
        pathname: '/record',
        state: { from: props.location }
      }}/>
    );
  }

  return (
    <div>
      <App layout={'playback'} />
    </div>
  );
}

const Record = () => (
  <div>
    <h2>Record a song!</h2>
    <App layout={'record'} />
  </div>
);

const BasicExample = () => (
  <Router>
    <div>
      {/*<ul>*/}
        {/*<li><Link to="/">Playback</Link></li>*/}
        {/*<li><Link to="/record">Record</Link></li>*/}
      {/*</ul>*/}
      <Route exact path="/" component={Playback}/>
      <Route path="/record" component={Record}/>
    </div>
  </Router>
);


ReactDOM.render(<BasicExample />, document.getElementById('root'));
//registerServiceWorker();
