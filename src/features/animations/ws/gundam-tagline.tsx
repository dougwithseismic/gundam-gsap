import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useEffect, useRef } from "react";
import { ScrambleText } from "../../scramble-effect/scramble-text";
import { SwipeBlocks } from "./swipe-blocks";

// Register plugins outside component
gsap.registerPlugin(SplitText, ScrambleTextPlugin);

interface GundamTaglineProps {
  title?: string;
  subtitle?: string;
}

export const GundamTagline = ({
  title = "SEISMIC",
  subtitle = "UNFAIR ADVANTAGE",
}: GundamTaglineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Create GSAP context for automatic cleanup
    contextRef.current = gsap.context(() => {
      // Initial state
      gsap.set("#seismic-tagline-title", { opacity: 0, y: 20 });
      gsap.set("#seismic-tagline-subtitle", { opacity: 0, y: 10 });

      // Animate title and subtitle containers
      const tl = gsap.timeline();
      tl.to("#seismic-tagline-title", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }).to(
        "#seismic-tagline-subtitle",
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6",
      );
    }, containerRef);

    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, [title, subtitle]);

  return (
    <div className="flex h-full w-full items-end" ref={containerRef}>
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <div className="relative">
            <div
              ref={textRef}
              className="flex h-fit flex-col overflow-hidden leading-none tracking-tighter text-text-muted [&_.lines-js]:!inline-block"
            >
              <SwipeBlocks delay={0.1} from="left" to="left">
                <div id="seismic-tagline-title" className="text-xs">
                  {title}
                </div>
              </SwipeBlocks>
              <SwipeBlocks delay={0.15}>
                <div
                  id="seismic-tagline-subtitle"
                  className="text-xl tracking-normal text-text-muted"
                >
                  <ScrambleText
                    continuous={true}
                    text={subtitle}
                    scrambleOptions={{
                      returnDuration: 0.5,
                      minScrambleCount: 1,
                      maxScrambleCount: 3,
                      scrambleChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    }}
                  />
                </div>
              </SwipeBlocks>
              <SwipeBlocks delay={0.4} from="left" to="left">
                <ScrambleText
                  className="mt-2 text-text-muted/50"
                  text="MANIFESTO//STATUS:ACTIVATED"
                  continuous={true}
                  scrambleOptions={{
                    returnDuration: 0.5,
                    minScrambleCount: 1,
                  }}
                />
              </SwipeBlocks>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
