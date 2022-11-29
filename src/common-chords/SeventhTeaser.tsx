import React, { FC, PropsWithChildren } from "react";
import { useCommonChordsQuery } from "./useCommonChordsQuery";

export const SeventhTeaser: FC<PropsWithChildren> = ({ children }) => {
  const { sevenths, setSevenths } = useCommonChordsQuery();

  if (sevenths) {
    return <>{children}</>;
  }

  return (
    <div className="tease7ths">
      <p>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => setSevenths(true)}
        >
          Enable 7th chords
        </button>{" "}
        to see more.
      </p>
    </div>
  );
};
