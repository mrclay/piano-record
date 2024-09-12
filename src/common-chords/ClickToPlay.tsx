import React, { useContext } from "react";
import { TourContext } from "../TourContext";
import { useStore } from "../store";

export const ClickToPlay = () => {
  const { activeItem, tourDispatch } = useContext(TourContext);
  const [song] = useStore.song();
  return (
    <div className="mt-5 ms-3 d-flex text-info">
      <span
        className="border border-info border-bottom-0 border-end-0 me-1 position-relative"
        style={{
          top: ".7rem",
          width: "0.5rem",
          height: "2rem",
        }}
      >
        <span
          className="bg-info position-absolute"
          style={{
            bottom: "-1px",
            left: "-.25rem",
            clipPath: "polygon(50% 100%, 0 0, 100% 0)",
            width: "0.5rem",
            height: ".5rem",
          }}
        ></span>
      </span>
      <p className="mb-4">
        Click to play a sample usage or{" "}
        <button
          type="button"
          disabled={Boolean(activeItem || song)}
          className="btn btn-outline-info btn-sm me-2"
          onClick={() => tourDispatch({ type: "start" })}
        >
          <i className="fa fa-play" aria-hidden="true"></i> listen to all
        </button>
        <button
          type="button"
          disabled={Boolean(activeItem || song)}
          className="btn btn-outline-info btn-sm me-2"
          onClick={() => tourDispatch({ type: "start-random" })}
        >
          <i className="fa fa-random" aria-hidden="true"></i> shuffle play
        </button>
        {activeItem ? (
          <button
            type="button"
            className="btn btn-danger btn-sm me-2"
            onClick={() => tourDispatch({ type: "reset" })}
          >
            stop
          </button>
        ) : null}
      </p>
    </div>
  );
};
