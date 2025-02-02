import { useCallback, useRef, useEffect } from "react";
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
  const scrambleIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const isHoveredRef = useRef(false);
  const elementListenersMap = useRef<
    Map<HTMLElement, { enter: () => void; leave: () => void }>
  >(new Map());

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

      // Remove any existing listeners for this element
      const existingListeners = elementListenersMap.current.get(element);
      if (existingListeners) {
        element.removeEventListener("mouseenter", existingListeners.enter);
        element.removeEventListener("mouseleave", existingListeners.leave);
      }

      // Add hover event listeners
      const handleMouseEnter = () => {
        isHoveredRef.current = true;
        // Clear any ongoing scramble effects
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
        }
        // Restore original text immediately
        element.innerHTML = originalText;
        // Add a subtle transition
        gsap.to(element, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        isHoveredRef.current = false;
        gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            if (continuous) {
              // Resume scrambling effect
              const timer = setTimeout(() => {
                scrambleText(element, false, true);
              }, 0);
              scrambleTimers.current.push(timer);
            }
          },
        });
      };

      // Store new listeners in the map
      elementListenersMap.current.set(element, {
        enter: handleMouseEnter,
        leave: handleMouseLeave,
      });

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      const chars = originalText.split("");

      // If currently being hovered, don't start scrambling
      if (isHoveredRef.current) {
        return;
      }

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
      scrambleIntervalRef.current = setInterval(
        () => {
          if (isHoveredRef.current) {
            clearInterval(scrambleIntervalRef.current);
            return;
          }

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
            clearInterval(scrambleIntervalRef.current);
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

            // If continuous and not being hovered, start the effect again after a delay
            if (continuous && !isHoveredRef.current) {
              const timer = setTimeout(() => {
                if (!isHoveredRef.current) {
                  scrambleText(element, false, true);
                }
              }, 2000);
              scrambleTimers.current.push(timer);
            }
          }
        },
        (currentDuration * 1000) / scrambleTimes,
      );
    },
    [
      scrambleChars,
      minScrambleCount,
      maxScrambleCount,
      duration,
      returnDuration,
    ],
  );

  const cleanup = useCallback(() => {
    // Clear all timeouts
    scrambleTimers.current.forEach((timer) => clearTimeout(timer));
    scrambleTimers.current = [];

    // Clear interval if any
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
    }

    // Remove all event listeners
    elementListenersMap.current.forEach((listeners, element) => {
      element.removeEventListener("mouseenter", listeners.enter);
      element.removeEventListener("mouseleave", listeners.leave);
    });
    elementListenersMap.current.clear();
  }, []);

  // Add cleanup for scramble effect intervals and timeouts
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    scrambleText,
    cleanup,
  };
};
