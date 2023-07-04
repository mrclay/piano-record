import React, { FC, PropsWithChildren } from "react";
import { useCommonChordsQuery } from "./useCommonChordsQuery";

export const SeventhTeaser: FC<PropsWithChildren> = ({ children }) => {
  const { sevenths, setSevenths } = useCommonChordsQuery();

  if (sevenths) {
    return <>{children}</>;
  }

  return (
    <div className="alert alert-info mt-5" role="alert">
      <button
        type="button"
        className="btn btn-info me-1"
        onClick={() => setSevenths(true)}
      >
        Enable 7th chords
      </button>{" "}
      to see more.
    </div>
  );
};
