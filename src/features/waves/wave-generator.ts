import { gsap } from "gsap";

export type WavePoint = {
  value: number;
  time: number;
};

export type WaveOptions = {
  min?: number;
  max?: number;
  steps?: number;
  frequency?: number;
};

export type WaveType = "noise" | "sine" | "square";

type GenerateWavePointsParams = {
  type?: WaveType;
  options?: WaveOptions;
};

type CreateWaveTimelineParams = {
  target: gsap.TweenTarget;
  type?: WaveType;
  options?: WaveOptions & {
    property?: string;
    repeat?: number;
    repeatRefresh?: boolean;
  };
};

export const generateWavePoints = ({
  type = "noise",
  options = {},
}: GenerateWavePointsParams = {}): WavePoint[] => {
  const { min = 0, max = 1, steps = 20, frequency = 1 } = options;
  const points: WavePoint[] = [];

  switch (type) {
    case "noise":
      // Random noise wave
      for (let i = 0; i < steps; i++) {
        if (i % 2 === 0) {
          points.push({
            value: min,
            time: i * (1 / steps),
          });
        } else {
          const rawValue = gsap.utils.random(min, max);
          points.push({
            value: rawValue,
            time: i * (1 / steps),
          });
        }
      }
      break;

    case "sine":
      // Smooth sine wave
      for (let i = 0; i < steps; i++) {
        const phase = (i / steps) * Math.PI * 2 * frequency;
        const normalizedValue = (Math.sin(phase) + 1) / 2;
        const value = min + normalizedValue * (max - min);
        points.push({
          value,
          time: i * (1 / steps),
        });
      }
      break;

    case "square":
      // Square wave
      for (let i = 0; i < steps; i++) {
        const value = i % 2 === 0 ? min : max;
        points.push({
          value,
          time: i * (1 / steps),
        });
      }
      break;
  }

  return points;
};

export const createWaveTimeline = ({
  target,
  type = "noise",
  options = {},
}: CreateWaveTimelineParams) => {
  const {
    property = "opacity",
    repeat = -1,
    repeatRefresh = true,
    ...waveOptions
  } = options;

  const timeline = gsap.timeline({
    repeat,
    repeatRefresh,
  });

  const points = generateWavePoints({ type, options: waveOptions });

  points.forEach((point, index) => {
    timeline.to(
      target,
      {
        [property]: point.value,
        duration: 0,
        ease: "none",
      },
      index > 0 ? `<${point.time}` : 0,
    );
  });

  return timeline;
};
