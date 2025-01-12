import React, { Fragment, useState } from "react";
import Clipboard from "react-clipboard.js";
import { escape } from "html-escaper";

import * as C from "../constants";
import Ops from "../Ops";
import { getEmbedUrl } from "../pages/EmbedPage";

interface SaverProps {
  href: string;
  title?: string;
  getMidi?: () => Promise<Blob>;
}

export default function Saver({ href, getMidi, title = "" }: SaverProps) {
  const [saved, setSaved] = useState("");

  const url = Ops.encodeMoreURIComponents(href);

  const markdownLink = `[${escape(title || C.DEFAULT_TITLE)}](${escape(url)})`;

  const { embedHtml } = getEmbedUrl(url);

  return (
    <span key={url}>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={url}
        onSuccess={() => setSaved(url)}
      >
        <Fragment>URL {saved === url && "copied!"}</Fragment>
      </Clipboard>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={embedHtml}
        onSuccess={() => setSaved(embedHtml)}
      >
        <Fragment>
          <i className="fa fa-code" aria-hidden="true" /> Embed code{" "}
          {saved === embedHtml && "copied!"}
        </Fragment>
      </Clipboard>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={markdownLink}
        onSuccess={() => setSaved(markdownLink)}
      >
        <Fragment>
          <i className="fa fa-code" aria-hidden="true" /> Markdown link{" "}
          {saved === markdownLink && "copied!"}
        </Fragment>
      </Clipboard>
      {getMidi ? (
        <button
          type="button"
          className="btn btn-dark"
          onClick={async () => {
            const blob = await getMidi!();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "mrclay-org-sequence.mid";

            const clickHandler = () => {
              setTimeout(() => {
                URL.revokeObjectURL(url);
                removeEventListener("click", clickHandler);
              }, 150);
            };

            a.addEventListener("click", clickHandler, false);
            a.click();
          }}
        >
          <i className="fa fa-file-code-o" aria-hidden="true" /> MIDI file{" "}
        </button>
      ) : null}
    </span>
  );
}
