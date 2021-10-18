import React from "react";

interface StatusProps {
  isRecording: boolean;
  isPlaying: boolean;
}

export default function Status({ isPlaying, isRecording }: StatusProps) {
  if (isPlaying) {
    return (
      <div id="status" className="playing">
        Playback...
      </div>
    );
  }
  if (isRecording) {
    return (
      <div id="status" className="recording">
        <i className="fa fa-circle" aria-hidden="true" /> Recording...
      </div>
    );
  }

  return (
    <div id="status" className="idle">
      &nbsp;
    </div>
  );
}
