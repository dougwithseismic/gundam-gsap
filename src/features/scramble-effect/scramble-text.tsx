"use client";

import { useEffect, useRef } from "react";
import { useScrambleEffect } from "./use-scramble-effect";

interface ScrambleTextProps {
  text: string;
  className?: string;
  continuous?: boolean;
  scrambleOptions?: Parameters<typeof useScrambleEffect>[0];
}

export const ScrambleText = ({
  text,
  className = "text-left",
  continuous = false,
  scrambleOptions,
}: ScrambleTextProps) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { scrambleText, cleanup } = useScrambleEffect(scrambleOptions);

  useEffect(() => {
    if (textRef.current) {
      scrambleText(textRef.current, false, continuous);
    }
    return cleanup;
  }, [scrambleText, continuous, cleanup]);

  return (
    <p ref={textRef} className={className}>
      {text}
    </p>
  );
};
