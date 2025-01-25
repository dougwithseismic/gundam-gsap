import { useCallback, useRef } from "react";
import { gsap } from "gsap";

interface ScrambleOptions {
  scrambleChars?: string;
  minScrambleCount?: number;
  maxScrambleCount?: number;
  duration?: number;
  returnDuration?: number;
}

export const useScrambleEffect = (options: ScrambleOptions = {}) => {
  const {
    scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?",
    minScrambleCount = 2,
    maxScrambleCount = 5,
    duration = 0.8,
    returnDuration = 1.2,
  } = options;

  const scrambleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrambleText = useCallback(
    (
      element: HTMLElement,
      isReturning: boolean = false,
      continuous: boolean = false,
    ) => {
      const originalText =
        element.getAttribute("data-original-text") || element.innerText;
      if (!element.getAttribute("data-original-text")) {
        element.setAttribute("data-original-text", originalText);
      }

      const chars = originalText.split("");

      // Pick random indices to scramble
      const numToScramble =
        Math.floor(Math.random() * (maxScrambleCount - minScrambleCount + 1)) +
        minScrambleCount;
      const indices = new Array(chars.length)
        .fill(0)
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, numToScramble);

      const currentDuration = isReturning ? returnDuration : duration;
      const scrambleTimes = isReturning ? 2 : Math.floor(Math.random() * 4) + 2;

      // Create spans for each character
      element.innerHTML = chars
        .map((char, i) => {
          const isScrambled = indices.includes(i);
          return `<span class="${
            isScrambled ? "scrambled" : ""
          }">${char}</span>`;
        })
        .join("");

      const scrambledElements = element.querySelectorAll(".scrambled");

      // Create a GSAP timeline for the scramble effect
      const tl = gsap.timeline();

      // Add scale and blur effects only to scrambled chars
      tl.to(scrambledElements, {
        scale: 1.02,
        filter: "blur(0.1px)",
        duration: currentDuration / 8,
        ease: "power2.out",
      });

      let currentScramble = 0;
      const scrambleInterval = setInterval(
        () => {
          scrambledElements.forEach((span) => {
            span.textContent =
              scrambleChars[Math.floor(Math.random() * scrambleChars.length)];

            // Add a subtle rotation on each scramble
            gsap.to(span, {
              rotation: (Math.random() - 0.5) * 1.2,
              duration: currentDuration / scrambleTimes,
              ease: "elastic.out(1, 0.3)",
            });
          });

          currentScramble++;
          if (currentScramble >= scrambleTimes) {
            clearInterval(scrambleInterval);
            if (isReturning) {
              // Restore original characters
              element.querySelectorAll("span").forEach((span, i) => {
                span.textContent = chars[i];
              });
            }

            // Return scrambled chars to normal state with elastic bounce
            tl.to(scrambledElements, {
              scale: 1,
              rotation: 0,
              filter: "blur(0px)",
              duration: currentDuration / 2,
              ease: "elastic.out(1, 0.3)",
            });

            // If continuous, start the effect again after a delay
            if (continuous && !isReturning) {
              setTimeout(() => {
                scrambleText(element, false, true);
              }, 2000);
            }
          }
        },
        (currentDuration * 1000) / scrambleTimes,
      );

      return () => {
        clearInterval(scrambleInterval);
      };
    },
    [
      scrambleChars,
      minScrambleCount,
      maxScrambleCount,
      duration,
      returnDuration,
    ],
  );

  const cleanup = () => {
    scrambleTimers.current.forEach((timer) => clearTimeout(timer));
    scrambleTimers.current = [];
  };

  return {
    scrambleText,
    cleanup,
  };
};
