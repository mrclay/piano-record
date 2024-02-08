import Progress from "./Progress";
import type { QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface PlayProps {
  handlePlay: QRL<() => void>;
  handleStop: QRL<() => void>;
  isPlaying: boolean;
  isWaiting: boolean;
  progress: number;
}

const Play = component$(
  ({ handlePlay, handleStop, progress, isPlaying, isWaiting }: PlayProps) => {
    function renderIcon() {
      if (isPlaying) {
        return <Progress ratio={progress} />;
      }

      return <i class="fa fa-stop" aria-hidden="true" />;
    }

    if (isPlaying) {
      return (
        <button
          type="button"
          onClick$={handleStop}
          id="big-play"
          class="btn btn-info med-btn"
          disabled={isWaiting}
        >
          {renderIcon()}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick$={handlePlay}
        id="big-play"
        disabled={isWaiting}
        class="btn btn-info med-btn"
      >
        <i class="fa fa-play" aria-hidden="true" />
      </button>
    );
  }
);

export default Play;
