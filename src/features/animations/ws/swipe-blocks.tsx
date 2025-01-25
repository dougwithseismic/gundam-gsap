import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

interface SwipeBlocksProps {
  height?: number;
  width?: number;
  delay?: number;
  children?: React.ReactNode;
  onAnimationComplete?: () => void;
  inDuration?: number;
  outDuration?: number;
  holdDuration?: number;
  ease?: string;
  outEase?: string;
  from?: "left" | "right" | "top" | "bottom";
  to?: "left" | "right" | "top" | "bottom";
}

export const SwipeBlocks = ({
  height,
  width,
  delay = 0,
  children,
  onAnimationComplete,
  inDuration = 0.5,
  outDuration = 0.5,
  holdDuration = 0.2,
  ease = "power4.inOut",
  outEase = "power4.out",
  from = "left",
  to = "right",
}: SwipeBlocksProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const darkBlockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!blockRef.current || !darkBlockRef.current || !contentRef.current)
      return;

    const tl = gsap.timeline({
      onComplete: onAnimationComplete,
    });

    // Set initial states
    gsap.set(contentRef.current, { opacity: 0 });
    gsap.set([blockRef.current, darkBlockRef.current], {
      scaleX: 0,
      scaleY: 1,
      transformOrigin: from,
    });

    // Animate blocks and content
    tl.to(blockRef.current, {
      scaleX: 1,
      duration: inDuration,
      ease,
      delay,
    })
      .to(
        darkBlockRef.current,
        {
          scaleX: 1,
          duration: inDuration,
          ease,
          delay: 0.1,
        },
        `<`,
      )
      .to(
        contentRef.current,
        {
          opacity: 1,
          duration: 0,
        },
        "<80%",
      )
      .to(
        darkBlockRef.current,
        {
          scaleX: 0,
          duration: outDuration,
          ease: outEase,
          transformOrigin: to,
        },
        `+=${holdDuration}`,
      )
      .to(
        blockRef.current,
        {
          scaleX: 0,
          duration: outDuration,
          ease: outEase,
          delay: 0.1,
          transformOrigin: to,
        },
        `<`,
      );

    return () => {
      tl.kill();
    };
  }, [
    delay,
    onAnimationComplete,
    inDuration,
    outDuration,
    holdDuration,
    ease,
    outEase,
    from,
    to,
  ]);

  return (
    <div className="relative">
      <div ref={contentRef}>{children}</div>
      <div
        ref={blockRef}
        className="absolute top-0 left-0 bg-gradient-to-r from-primary-600 to-primary-600"
        style={{
          height: height || "100%",
          width: width || "100%",
        }}
      />
      <div
        ref={darkBlockRef}
        className="absolute top-0 left-0 animate-pulse bg-gradient-to-r from-primary-800 to-primary-800"
        style={{
          height: height || "100%",
          width: width || "100%",
        }}
      />
    </div>
  );
};
