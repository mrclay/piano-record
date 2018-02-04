import React from 'react';

import * as C from "../constants";
import Ops from "../Ops";

export default function Table(props) {
  const htmlize = Ops.encodeHtml;
  const url = Ops.encodeMoreURIComponents(props.href);

  const title = props.title || C.DEFAULT_TITLE;
  const markdownLink = `[${htmlize(title)}](${htmlize(url)})`;
  const htmlLink = `<a href="${htmlize(url)}">${htmlize(title)}</a>`;

  return (
    <table className="table table-bordered table-striped urls">
      <colgroup>
        <col className="col-xs-1"/>
        <col className="col-xs-7"/>
      </colgroup>
      <tbody>
      <tr>
        <th scope="row">URL</th>
        <td><input type='text' value={url} readOnly /></td>
      </tr>
      <tr>
        <th scope="row">Markdown</th>
        <td><input type='text' value={markdownLink} readOnly /></td>
      </tr>
      <tr>
        <th scope="row">HTML</th>
        <td><input type='text' value={htmlLink} readOnly /></td>
      </tr>
      </tbody>
    </table>
  );
}
