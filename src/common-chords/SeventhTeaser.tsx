import React, { FC } from "react";

interface SeventhTeaserProps {
  sevenths: boolean;
  enableSevenths(): void;
}

export const SeventhTeaser: FC<SeventhTeaserProps> = ({
  children,
  sevenths,
  enableSevenths,
}) => {
  if (sevenths) {
    return <>{children}</>;
  }

  return (
    <div className="tease7ths">
      <p>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => enableSevenths()}
        >
          Enable 7th chords
        </button>{" "}
        to see more.
      </p>
    </div>
  );
};
