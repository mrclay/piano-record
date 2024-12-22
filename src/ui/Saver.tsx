import React, { useState } from "react";
import Clipboard from "react-clipboard.js";
import { escape } from "html-escaper";

import * as C from "../constants";
import Ops from "../Ops";

interface SaverProps {
  href: string;
  title?: string;
}

export default function Saver({ href, title = "" }: SaverProps) {
  const [saved, setSaved] = useState("");

  const url = Ops.encodeMoreURIComponents(href);

  const markdownLink = `[${escape(title || C.DEFAULT_TITLE)}](${escape(url)})`;
  const htmlLink = `<a href="${escape(url)}">${escape(
    title || C.DEFAULT_TITLE,
  )}</a>`;

  const iframeUrl = window.origin + `/embed?${new URLSearchParams({ url })}`;
  const embedHtml = `<iframe src="${escape(iframeUrl)}" height="100" width="600" style="width:100%"></iframe>`;

  return (
    <span key={url}>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={url}
        onSuccess={() => setSaved(url)}
      >
        URL {saved === url && "copied!"}
      </Clipboard>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={embedHtml}
        onSuccess={() => setSaved(embedHtml)}
      >
        <i className="fa fa-code" aria-hidden="true" /> Embed code{" "}
        {saved === embedHtml && "copied!"}
      </Clipboard>
      <Clipboard
        className="btn btn-dark"
        data-clipboard-text={markdownLink}
        onSuccess={() => setSaved(markdownLink)}
      >
        <i className="fa fa-code" aria-hidden="true" /> Markdown link{" "}
        {saved === markdownLink && "copied!"}
      </Clipboard>
    </span>
  );
}
