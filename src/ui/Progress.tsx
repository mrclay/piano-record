import { component$ } from "@builder.io/qwik";

export interface ProgressProps {
  ratio: number;
  steps?: [active: number, total: number];
}

const Progress = component$(({ ratio, steps }: ProgressProps) => {
  const percentage = Math.round(
    (steps ? (steps[0] + 1) / steps[1] : ratio) * 100
  );
  const style = {
    transition: "width 250ms",
    width: percentage + "%",
  };

  return (
    <div
      class="progress"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div class="progress-bar" style={style} />
    </div>
  );
});

export default Progress;
