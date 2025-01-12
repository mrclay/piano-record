import { useEffect, useMemo, useRef } from "react";
import {
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  PieController,
  Tooltip,
} from "chart.js";
import { draw } from "patternomaly";
import { GuessKeyScore } from "../pages/GuessKeyPage";
import { keyColors } from "../music-theory/opinion/key-colors";
import { ThirdQuality } from "../music-theory/constants";

Chart.register([PieController, ArcElement, Legend, Tooltip]);

interface PieProps {
  id: string;
  onClick?: (score?: GuessKeyScore) => void;
  onHover?: (score?: GuessKeyScore) => void;
  scores: GuessKeyScore[];
}

export default function Pie({ id, onClick, onHover, scores }: PieProps) {
  const ctxRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"pie"> | null>(null);

  const reordered = useMemo(() => {
    const temp = scores.reduce<GuessKeyScore[]>((acc, curr, idx) => {
      if (acc.length === scores.length) {
        // Done
        return acc;
      }

      if (idx % 2 !== 0) {
        acc.push(curr);
      } else {
        acc.unshift(curr);
      }
      return acc;
    }, []);

    const max = Math.max(...temp.map(el => el.total));
    const maxIdx = temp.findIndex(el => el.total === max);

    return [...temp.slice(maxIdx), ...temp.slice(0, maxIdx)];
  }, [scores]);

  const rotation = useMemo(() => {
    const scoresSum = reordered
      .map(el => el.total)
      .reduce((acc, curr) => acc + curr, 0);
    return -((reordered[0]!.total / scoresSum) * 360) / 2;
  }, [reordered]);

  const data = useMemo(
    () =>
      ({
        labels: reordered.map(({ key }) => key.toString(true)),
        datasets: [
          {
            data: reordered.map(({ total }) => total),
            backgroundColor: reordered.map(({ key }) => {
              if (key.quality === ThirdQuality.MAJOR) {
                return keyColors.get(key.getTonicNote().getChromatic())!;
              }

              const relMajor = key.items[2]!.getChromatic();
              const color = keyColors.get(relMajor)!;
              return draw("diagonal-right-left", color, "#333", 7);
            }),
            hoverOffset: 20,
            borderColor: "#000",
            rotation,
          },
        ],
      }) satisfies ChartData<"pie">,
    [reordered],
  );

  const options: ChartOptions<"pie"> = useMemo(() => {
    let lastHoverVal: GuessKeyScore | null = null;

    return {
      responsive: true,
      animation: { animateRotate: false },
      color: "#ccc",
      layout: {
        padding: 10,
      },
      onClick(_event, elements) {
        if (onClick) {
          const idx = elements[0]?.index;
          onClick(typeof idx === "number" ? reordered[idx] : undefined);
        }
      },
      onHover(_event, elements) {
        if (onHover) {
          const idx = elements[0]?.index;
          if (typeof idx === "number") {
            const val = reordered[idx]!;
            if (lastHoverVal !== val) {
              onHover(val);
              lastHoverVal = val;
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(tooltipItem): string | string[] | void {
              return `${tooltipItem.formattedValue} points`;
            },
          },
          padding: 10,
          displayColors: false,
        },
      },
    };
  }, [reordered, onClick]);

  useEffect(() => {
    if (!ctxRef.current) {
      return;
    }

    let chart = chartRef.current;
    if (chart) {
      chart.data = data;
      chart.options = options;
      chart.update();
      return;
    }

    chart = new Chart<"pie">(ctxRef.current, {
      type: "pie",
      data,
      options,
    });
    chartRef.current = chart;
  }, [ctxRef.current, data, options]);

  return <canvas id={id} ref={ctxRef} />;
}
