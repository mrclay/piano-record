import React, { FC, PropsWithChildren, ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Paths from "../Paths";
import { BottomCenterAd } from "../ui/Ads";

interface ListItemLinkProps extends PropsWithChildren {
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

export const TemplateNav: FC = () => {
  return (
    <nav className="nav nav-tabs TemplateNav">
      <ListItemLink to={Paths.pianoPrefix("/")}>
        <i className="fa fa-music" aria-hidden="true" /> Melody
      </ListItemLink>
      <ListItemLink to={Paths.chordPrefix("/")}>
        <i className="fa fa-flask" aria-hidden="true" /> Chord
      </ListItemLink>
      <ListItemLink to={Paths.sequencePrefix("/")}>
        <i className="fa fa-repeat" aria-hidden="true" /> Sequence
      </ListItemLink>
      <ListItemLink to={Paths.commonChordsPrefix("/C-major")}>
        <i className="fa fa-book" aria-hidden="true" /> Common Chords
      </ListItemLink>
      <li>
        <a href="https://github.com/mrclay/piano-record">
          <i className="fa fa-github" aria-hidden="true" /> Source code
        </a>
      </li>
      <li>
        <a href="/music/">Steve's music</a>
      </li>
    </nav>
  );
};

interface TemplateProps extends PropsWithChildren {
  title: ReactNode | ReactNode[];
  intro: ReactNode;
  showLimitations?: boolean;
}

const Template: FC<TemplateProps> = ({
  children,
  intro,
  title,
  showLimitations = true,
}) => {
  const titleEls = Array.isArray(title) ? title : [title];
  return (
    <div>
      <TemplateNav />

      <div className="head-flex">
        {titleEls.map((item, i) =>
          i === 0 ? (
            <div key={i}>
              <h1 className="h2">{item}</h1>
            </div>
          ) : (
            <div key={i}>{item}</div>
          )
        )}
      </div>

      <div className="Template-intro">{intro}</div>

      {children}

      <section>
        <hr />

        <BottomCenterAd />

        {Boolean(showLimitations) && (
          <>
            <h3>Limitations</h3>
            <p>
              <strong>No velocity is captured.</strong> There are a <i>lot</i>{" "}
              of piano samples and I'd have to pull a ton more of them in on the
              initial page load, or hack the velocity by playing the existing
              ones at different volumes, probably not sounding great. I've also
              considered just bailing on the piano sound and generating
              something pleasant with Tone.js. I'm open to suggestions.
            </p>
            <p>
              <strong>Captured timing is imperfect</strong>. Due to the reliance
              on setTimeout() to play back notes, timing was never going to be
              great, plus, more exact timing makes the URLs much bigger, so I've
              sacrificed some granularity. This isn't for professional work.
            </p>
          </>
        )}

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
