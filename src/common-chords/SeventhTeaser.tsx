import React, { FC } from "react";
import { useStore } from "../store";

export const SeventhTeaser: FC = ({ children }) => {
  const [sevenths, setSevenths] = useStore.sevenths();

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
