import React from "react";

export const ClickToPlay = () => (
  <div className="mt-4 ms-3 d-flex text-info">
    <span
      className="border border-info border-bottom-0 border-end-0 me-1 position-relative"
      style={{
        top: ".7rem",
        width: "0.5rem",
        height: "1.25rem",
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
    <p>Click to play a sample usage.</p>
  </div>
);
