import { component$, Slot } from "@builder.io/qwik";
import Paths from "../Paths";
import { Link, useLocation } from "@builder.io/qwik-city";

interface CNProps {
  moreClass?: string;
}

export const H1 = component$<CNProps>(({ moreClass = "" }) => (
  <h1 class={`h2 ${moreClass}`}>
    <Slot />
  </h1>
));

export const Content900 = component$<CNProps>(({ moreClass = "" }) => (
  <div class={`mx-auto max-width-900 mt-5 mb-4 ${moreClass}`}>
    <Slot />
  </div>
));

export const Container900 = component$<CNProps>(({ moreClass = "" }) => (
  <div class={`mx-auto max-width-900 ${moreClass}`}>
    <Slot />
  </div>
));

export const HrFinal = component$(() => <hr class="HrFinal" />);

interface ListItemLinkProps {
  to: string;
}

const ListItemLink = component$<ListItemLinkProps>(({ to, ...rest }) => {
  const { url } = useLocation();
  return (
    <Link
      href={to}
      {...rest}
      class={
        "d-inline-block link-light text-decoration-none" +
        (url.pathname.indexOf(to) === 0 ? "active" : "")
      }
      prefetch={false}
    >
      <Slot />
    </Link>
  );
});

export const HeadingNav = component$(() => {
  return (
    <div class="HeadingNav d-flex flex-wrap">
      <ListItemLink to={Paths.pianoPrefix("/")}>
        <i class="fa fa-music" aria-hidden="true" /> Melody
      </ListItemLink>
      <ListItemLink to={Paths.chordPrefix("/")}>
        <i class="fa fa-flask" aria-hidden="true" /> Chord
      </ListItemLink>
      <ListItemLink to={Paths.sequencePrefix("/")}>
        <i class="fa fa-repeat" aria-hidden="true" /> Sequence
      </ListItemLink>
      <ListItemLink to={Paths.guessKeyPrefix("/")}>
        <i class="fa fa-key" aria-hidden="true" /> Guess the Key
      </ListItemLink>
      <ListItemLink to={Paths.commonChordsPrefix("/C-major")}>
        <i class="fa fa-book" aria-hidden="true" /> Common Chords
      </ListItemLink>
      <a
        class="d-inline-block link-light text-decoration-none opacity-50"
        href="https://github.com/mrclay/piano-record"
      >
        <i class="fa fa-github" aria-hidden="true" /> Source code
      </a>
      <a
        class="d-inline-block link-light text-decoration-none opacity-50"
        href="/music/"
      >
        Steve's music
      </a>
    </div>
  );
});
