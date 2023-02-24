import React, { FC, HTMLAttributes, PropsWithChildren } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Paths from "../Paths";

export const H1 = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <h1 className={`h2 ${className}`}>{children}</h1>
);

export const Content900 = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <div className={`mx-auto max-width-900 mt-5 mb-4 ${className}`}>
    {children}
  </div>
);

export const Container900 = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <div className={`mx-auto max-width-900 ${className}`}>{children}</div>
);

export const HrFinal = () => <hr className="HrFinal" />;

interface ListItemLinkProps extends PropsWithChildren {
  to: string;
}

const ListItemLink: FC<ListItemLinkProps> = ({ to, ...rest }) => {
  const { pathname } = useLocation();
  return (
    <NavLink
      to={to}
      {...rest}
      className={
        "d-inline-block link-light text-decoration-none" +
        (pathname.indexOf(to) === 0 ? "active" : "")
      }
    />
  );
};

export const HeadingNav: FC = () => {
  return (
    <div className="HeadingNav d-flex flex-wrap">
      <ListItemLink to={Paths.pianoPrefix("/")}>
        <i className="fa fa-music" aria-hidden="true" /> Melody
      </ListItemLink>
      <ListItemLink to={Paths.chordPrefix("/")}>
        <i className="fa fa-flask" aria-hidden="true" /> Chord
      </ListItemLink>
      <ListItemLink to={Paths.sequencePrefix("/")}>
        <i className="fa fa-repeat" aria-hidden="true" /> Sequence
      </ListItemLink>
      <ListItemLink to={Paths.guessKeyPrefix("/")}>
        <i className="fa fa-key" aria-hidden="true" /> Guess the Key
      </ListItemLink>
      <ListItemLink to={Paths.commonChordsPrefix("/C-major")}>
        <i className="fa fa-book" aria-hidden="true" /> Common Chords
      </ListItemLink>
      <a
        className="d-inline-block link-light text-decoration-none opacity-50"
        href="https://github.com/mrclay/piano-record"
      >
        <i className="fa fa-github" aria-hidden="true" /> Source code
      </a>
      <a
        className="d-inline-block link-light text-decoration-none opacity-50"
        href="/music/"
      >
        Steve's music
      </a>
    </div>
  );
};
