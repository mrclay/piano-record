import Paths from '../Paths';
import React from 'react';
import {Link, Route} from 'react-router-dom';

const ListItemLink = ({ to, ...rest }) => (
  <Route path={to} children={({ match }) => (
    <li className={match ? 'active' : ''}>
      <Link to={to} {...rest} />
    </li>
  )} />
);

const Template = props => {
  let header;
  if (props.app === 'chord') {
    header = (
      <div>
        <h1 className={'h2'}>Simple Chord</h1>
        <p>Wanna capture a <a href={Paths.chordPrefix('/43,56,60,62,65/G7b9sus')}>chord</a> or share it with others? Tap some notes or play your MIDI keyboard (Chrome only), and click <i>Save</i>. You can share the resulting page URL or bookmark it. <a href="https://github.com/mrclay/piano-record">Source</a>.</p>
      </div>
    );
  } else {
    header = (
      <div>
        <h1 className={'h2'}>Simple Piano</h1>
        <p>Wanna capture a <a href={Paths.pianoPrefix('/songs/C320C3c30C3e3bC423hC454bD3c8gC448uC3b8xD4299D459cC40eaC3aedD44elD3berD3ejnC42l8D3al9C39laD40lhD39ohC40oiC38oiD42p5C3eqtD40quC37tgD38thC40tlD3eu1C42wnD40x3D3713nC3613zC3e144D4214cD3e1fuD361gaD321gf/Hello%20World')}>short musical idea</a> or share it with others? Tap some notes or play your MIDI keyboard (Chrome only), and click <i>Save</i>. You can share the resulting page URL or bookmark it. <a href="https://github.com/mrclay/piano-record">Source</a>.</p>
      </div>
    );
  }

  return (
    <div>
      {header}
      <nav className="nav nav-tabs">
        <ListItemLink to={Paths.pianoPrefix('/')}>Songs</ListItemLink>
        <ListItemLink to={Paths.chordPrefix('/')}>Chords</ListItemLink>
      </nav>

      {props.children}

      <section>
        <hr />
        <h3>Limitations</h3>
        <p><strong>No velocity is captured (yet).</strong> There are a <i>lot</i> of piano samples and I'd have to pull a ton more of them in on the initial page load, or hack the velocity by playing the existing ones at different volumes, probably not sounding great. I've also considered just bailing on the piano sound and generating something pleasant with Tone.js. I'm open to suggestions.</p>
        <p><strong>Captured timing is imperfect</strong>. Due to the reliance on setTimeout() to play back notes, timing was never going to be great, plus, more exact timing makes the URLs much bigger, so I've sacrificed some granularity. This isn't for professional work.</p>
        <h4>Credits</h4>
        <ul>
          <li><a href="http://www.mrclay.org/">Steve Clay</a>: <a href="https://github.com/mrclay/piano-record">This app</a>.</li>
          <li><a href="https://yotammann.info/">Yotam Mann</a>: <a href="https://github.com/tambien/Piano">API modeling a piano</a> using <a href="https://archive.org/details/SalamanderGrandPianoV3">Salamander samples</a>, based on <a href="https://tonejs.github.io/">Tone.js</a>.</li>
        </ul>
      </section>
    </div>
  );
};

export default Template;
