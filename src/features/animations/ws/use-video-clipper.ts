import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

export const useVideoClipper = (text: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitTextRef = useRef<SplitText | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create GSAP context for automatic cleanup
    contextRef.current = gsap.context(() => {
      // Split text
      splitTextRef.current = new SplitText(containerRef.current!, {
        type: "lines",
      });

      // Create timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Set initial states
      gsap.set(containerRef.current, {
        perspective: 400,
      });

      gsap.set(splitTextRef.current.lines, {
        transformStyle: "preserve-3d",
        transformOrigin: "center center -150",
        opacity: 0,
        rotationX: -90,
      });

      // Add animations to timeline
      tl.to(splitTextRef.current.lines, {
        duration: 1,
        opacity: 1,
        rotationX: 0,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
      if (splitTextRef.current) {
        splitTextRef.current.revert();
      }
    };
  }, [text]);

  return {
    containerRef,
  };
};
