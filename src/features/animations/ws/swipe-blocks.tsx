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
  from = "right",
  to = "right",
}: SwipeBlocksProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const darkBlockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!blockRef.current || !darkBlockRef.current || !contentRef.current)
      return;

    // Create GSAP context for automatic cleanup
    contextRef.current = gsap.context(() => {
      gsap.set(contentRef.current, { opacity: 0 });
      gsap.set([blockRef.current, darkBlockRef.current], {
        scaleX: 0,
        transformOrigin: from === "left" ? "left center" : "right center",
      });

      const tl = gsap.timeline({
        delay,
        onComplete: () => {
          if (contentRef.current) {
            contentRef.current.style.transform = "none";
          }
        },
      });

      tl.to([blockRef.current, darkBlockRef.current], {
        scaleX: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.inOut",
      })
        .to(contentRef.current, {
          opacity: 1,
          duration: 0.1,
        })
        .to([darkBlockRef.current, blockRef.current], {
          scaleX: 0,
          duration: 0.5,
          stagger: 0.1,
          transformOrigin: to === "left" ? "left center" : "right center",
          ease: "power2.inOut",
        });
    });

    return () => {
      // Kill all animations and clean up context
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, [from, to, delay]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="relative z-10 inline-block"
        style={{ opacity: 0 }}
      >
        {children}
      </div>
      <div
        ref={blockRef}
        className="absolute inset-0 z-20 bg-primary-400"
        style={{ transformOrigin: "right center", transform: "scaleX(0)" }}
      />
      <div
        ref={darkBlockRef}
        className="absolute inset-0 z-30 bg-primary-950"
        style={{ transformOrigin: "right center", transform: "scaleX(0)" }}
      />
    </div>
  );
};
