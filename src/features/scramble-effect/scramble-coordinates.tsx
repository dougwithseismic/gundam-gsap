import { useEffect, useRef } from "react";
import { useScrambleEffect } from "./use-scramble-effect";

interface ScrambleCoordinatesProps {
  lat: number;
  lon: number;
  className?: string;
}

export const ScrambleCoordinates = ({
  lat,
  lon,
  className = "",
}: ScrambleCoordinatesProps) => {
  const coordRef = useRef<HTMLSpanElement>(null);
  const { scrambleText, cleanup } = useScrambleEffect({
    scrambleChars: "¥€£₿¢¤₽₹§@#$%^&*",
    minScrambleCount: 1,
    maxScrambleCount: 3,
    duration: 0.5,
    returnDuration: 0.8,
  });

  useEffect(() => {
    if (coordRef.current) {
      scrambleText(coordRef.current, false, false);
    }
    return cleanup;
  }, [scrambleText, cleanup, lat, lon]);

  return (
    <span ref={coordRef} className={className}>
      [LOCK:{Math.abs(lat)}°{lat >= 0 ? "N" : "S"}_{Math.abs(lon)}°
      {lon >= 0 ? "E" : "W"}]
    </span>
  );
};
