import React, { useState } from "react";
import Clipboard from "react-clipboard.js";

import * as C from "../constants";
import Ops from "../Ops";

interface TableProps {
  href: string;
  title?: string;
}

export default function Table({ href, title = "" }: TableProps) {
  const [saved, setSaved] = useState("");

  const htmlize = Ops.encodeHtml;
  const url = Ops.encodeMoreURIComponents(href);

  const markdownLink = `[${htmlize(title || C.DEFAULT_TITLE)}](${htmlize(
    url
  )})`;
  const htmlLink = `<a href="${htmlize(url)}">${htmlize(
    title || C.DEFAULT_TITLE
  )}</a>`;

  return (
    <span key={url}>
      <Clipboard
        className="btn btn-default"
        data-clipboard-text={url}
        onSuccess={() => setSaved(url)}
      >
        URL {saved === url && "copied!"}
      </Clipboard>
      <Clipboard
        className="btn btn-default"
        data-clipboard-text={markdownLink}
        onSuccess={() => setSaved(markdownLink)}
      >
        Markdown {saved === markdownLink && "copied!"}
      </Clipboard>
      <Clipboard
        className="btn btn-default"
        data-clipboard-text={htmlLink}
        onSuccess={() => setSaved(htmlLink)}
      >
        HTML {saved === htmlLink && "copied!"}
      </Clipboard>
    </span>
  );
}
