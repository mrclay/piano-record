import type { QRL } from "@builder.io/qwik";
import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import copy from "copy-to-clipboard";
import * as C from "../constants";
import Ops from "../Ops";

interface SaverProps {
  href: string;
  title?: string;
}

const Saver = component$(({ href, title = "" }: SaverProps) => {
  const saved = useSignal("");

  const htmlize = Ops.encodeHtml;
  const url = Ops.encodeMoreURIComponents(href);

  const markdownLink = `[${htmlize(title || C.DEFAULT_TITLE)}](${htmlize(
    url
  )})`;
  const htmlLink = `<a href="${htmlize(url)}">${htmlize(
    title || C.DEFAULT_TITLE
  )}</a>`;

  return (
    <span key={url} data-href={href}>
      <Clipboard
        data={url}
        done={$(() => {
          saved.value = url;
        })}
      >
        URL {saved.value === url && "copied!"}
      </Clipboard>
      <Clipboard
        data={markdownLink}
        done={$(() => {
          saved.value = markdownLink;
        })}
      >
        <i class="fa fa-code" aria-hidden="true" /> Markdown link{" "}
        {saved.value === markdownLink && "copied!"}
      </Clipboard>
      <Clipboard
        data={htmlLink}
        done={$(() => {
          saved.value = htmlLink;
        })}
      >
        <i class="fa fa-code" aria-hidden="true" /> HTML link{" "}
        {saved.value === htmlLink && "copied!"}
      </Clipboard>
    </span>
  );
});

interface ClipboardProps {
  data: string;
  done: QRL<() => void>;
}

const Clipboard = component$(({ data, done }: ClipboardProps) => {
  return (
    <button
      class="btn btn-dark"
      onClick$={$(() => {
        copy(data);
        done();
      })}
    >
      <Slot />
    </button>
  );
});

export default Saver;
