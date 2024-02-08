import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const IndexPage = component$(() => {
  return <div />;
});

export default IndexPage;

export const head: DocumentHead = {
  title: "mrclay.org",
  meta: [],
};
