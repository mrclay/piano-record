import React, { FC, ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Paths from "../Paths";

interface ListItemLinkProps {
  to: string;
}

const ListItemLink: FC<ListItemLinkProps> = ({ to, ...rest }) => {
  const { pathname } = useLocation();
  return (
    <li className={pathname.indexOf(to) === 0 ? "active" : ""}>
      <NavLink to={to} {...rest} />
    </li>
  );
};

interface TemplateProps {
  app: string;
  title: string;
  intro: ReactNode;
}

export const TemplateNav: FC = () => {
  return (
    <nav className="nav nav-tabs">
      <ListItemLink to={Paths.pianoPrefix("/")}>Songs</ListItemLink>
      <ListItemLink to={Paths.chordPrefix("/")}>Chords</ListItemLink>
      <ListItemLink to={Paths.sequencePrefix("/")}>
        Sequence (beta)
      </ListItemLink>
      <ListItemLink to={Paths.commonChordsPrefix("/C-major")}>
        Common Chords
      </ListItemLink>
    </nav>
  );
};

const Template: FC<TemplateProps> = ({ app, children, intro, title }) => {
  return (
    <div>
      <div>
        <h1 className="h2">{title}</h1>
        {intro}
      </div>

      <TemplateNav />

      {children}

      <section>
        <hr />
        <h3>Limitations</h3>
        <p>
          <strong>No velocity is captured (yet).</strong> There are a <i>lot</i>{" "}
          of piano samples and I'd have to pull a ton more of them in on the
          initial page load, or hack the velocity by playing the existing ones
          at different volumes, probably not sounding great. I've also
          considered just bailing on the piano sound and generating something
          pleasant with Tone.js. I'm open to suggestions.
        </p>
        <p>
          <strong>Captured timing is imperfect</strong>. Due to the reliance on
          setTimeout() to play back notes, timing was never going to be great,
          plus, more exact timing makes the URLs much bigger, so I've sacrificed
          some granularity. This isn't for professional work.
        </p>
        <h4>Credits</h4>
        <ul>
          <li>
            <a href="http://www.mrclay.org/">Steve Clay</a>:{" "}
            <a href="https://github.com/mrclay/piano-record">This app</a>.
          </li>
          <li>
            <a href="https://yotammann.info/">Yotam Mann</a>:{" "}
            <a href="https://github.com/tambien/Piano">API modeling a piano</a>{" "}
            using{" "}
            <a href="https://archive.org/details/SalamanderGrandPianoV3">
              Salamander samples
            </a>
            , based on <a href="https://tonejs.github.io/">Tone.js</a>.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Template;
