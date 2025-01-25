import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useEffect, useRef } from "react";
import { ScrambleText } from "../../scramble-effect/scramble-text";
import { createWaveTimeline } from "../../waves/wave-generator";
import { SwipeBlocks } from "./swipe-blocks";

// Register plugins outside component
gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export const GundamTagline = ({
  title = "Gundam Mobile Suit",
  subtitle = "Sandrock Armadillo EW",
}: {
  title?: string;
  subtitle?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<gsap.core.Timeline | null>(null);
  const splitTextRef = useRef<SplitText | null>(null);

  // Noise wave generator effect
  useEffect(() => {
    if (!terminalRef.current) return;

    // Create noise timeline using our new utility
    noiseRef.current = createWaveTimeline({
      target: terminalRef.current,
      type: "noise",
      options: {
        min: 0.2,
        max: 1,
        steps: 20,
      },
    });

    return () => {
      if (noiseRef.current) {
        noiseRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    if (!textRef.current) return;

    splitTextRef.current = new SplitText(textRef.current, {
      type: "lines,words",
      linesClass: "lines-js",
      lineThreshold: 0.5,
      wordDelimiter: " ",
    });

    gsap.from("#gundam-tagline-title", {
      duration: 0.7,
      delay: 0.6,
      ease: "power1.inOut",
      scrambleText: {
        text: title,
      },
    });

    gsap.from("#gundam-tagline-subtitle", {
      duration: 0.7,
      delay: 0.6,
      ease: "power1.inOut",
      scrambleText: {
        text: subtitle,
      },
    });
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
                <div id="gundam-tagline-title">{title}</div>
              </SwipeBlocks>
              <SwipeBlocks delay={0.15}>
                <div
                  id="gundam-tagline-subtitle"
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
                  text="WS_TERMINAL//UNIT:89.102.174.35"
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
        <div ref={terminalRef} className="col-span-4"></div>
      </div>
    </div>
  );
};
