import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SwipeBlocks } from "../animations/ws/swipe-blocks";
import { ScrambleText } from "../scramble-effect/scramble-text";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface PreloaderProps {
  isReady: boolean;
}

export const Preloader = ({ isReady }: PreloaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Setup scroll animations
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".smooth-wrapper",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        if (contentRef.current) {
          gsap.to(contentRef.current, {
            opacity: 1 - self.progress,
            scale: 0.95 + 0.05 * (1 - self.progress),
            duration: 0,
          });
        }
      },
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  // Setup visibility animations
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.to(containerRef.current, {
      autoAlpha: isReady ? 0 : 1,
      duration: 0.8,
      ease: "expo.inOut",
    });
  }, [isReady]);

  // Setup loading animation
  useEffect(() => {
    const loadingElement = document.querySelector('[data-loading="true"]');
    if (loadingElement) {
      gsap.to(loadingElement, {
        opacity: 0,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        visibility: "visible",
        backgroundColor: "rgba(0, 0, 0, 0.95)",
      }}
    >
      {/* Content Overlay */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SwipeBlocks>
          <ScrambleText
            text="WS™"
            className="font-mono text-4xl font-bold text-white sm:text-6xl md:text-8xl"
            continuous={true}
            scrambleOptions={{
              maxScrambleCount: 3,
              scrambleChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ™",
            }}
          />
        </SwipeBlocks>
        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-xs text-white/50" data-loading="true">
            loading...
          </div>
        </div>
      </div>
    </div>
  );
};
