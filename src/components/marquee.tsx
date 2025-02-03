import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right"; // default is left
  speed?: number; // duration (in seconds) for one cycle
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = "left",
  speed = 20,
}) => {
  const marqueeContainer = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const container = marqueeContainer.current;
    if (!container) return;

    // Find the content element
    const content = container.querySelector(".marquee-content") as HTMLElement;
    if (!content) return;

    // Clone content multiple times to ensure smooth looping
    for (let i = 0; i < 4; i++) {
      const clone = content.cloneNode(true) as HTMLElement;
      container.appendChild(clone);
    }

    // Measure the width of a single content element
    const contentWidth = content.offsetWidth;

    // Create a GSAP animation
    animationRef.current = gsap.to(container, {
      x: direction === "left" ? -contentWidth : contentWidth,
      ease: "none",
      repeat: -1,
      duration: speed,
      modifiers: {
        x: (x) => {
          return gsap.utils.wrap(-contentWidth, 0, parseFloat(x)) + "px";
        },
      },
    });

    // On scroll, temporarily increase the speed
    const handleScroll = () => {
      if (animationRef.current) {
        // Increase speed by 2x
        animationRef.current.timeScale(2);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = window.setTimeout(() => {
          if (animationRef.current) {
            // Return to normal speed
            animationRef.current.timeScale(1);
          }
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [direction, speed]);

  return (
    <div className="marquee-outer overflow-hidden py-1 select-none">
      <div ref={marqueeContainer} style={{ display: "flex" }}>
        <div className="marquee-content whitespace-nowrap">{children}</div>
      </div>
    </div>
  );
};

export { Marquee };
