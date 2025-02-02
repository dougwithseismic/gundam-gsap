import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SwipeBlocks } from "../animations/ws/swipe-blocks";
import { ScrambleText } from "../scramble-effect/scramble-text";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface PreloaderProps {
  isReady: boolean;
  lockdownDuration?: number;
}

export const Preloader = ({
  isReady,
  lockdownDuration = 30,
}: PreloaderProps) => {
  const [timeRemaining, setTimeRemaining] = useState(lockdownDuration * 1000);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const [isNearingEnd, setIsNearingEnd] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Handle initial video setup
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, []);

  // Handle countdown
  useEffect(() => {
    let interval: number;

    if (isReady && !isLocked) {
      setHasStartedCountdown(true);

      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 100);

          // Check if we're at 10% of the total time
          if (newTime <= lockdownDuration * 100) {
            // 10% of initial time (in ms)
            setIsNearingEnd(true);
            // Fade content back in
            if (contentRef.current) {
              gsap.to(contentRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "expo.out",
              });
            }
            // Kill scroll trigger
            if (scrollTriggerRef.current) {
              scrollTriggerRef.current.kill();
            }
          }

          if (newTime <= 0) {
            setIsLocked(true);
            clearInterval(interval);

            // Animate background when locking
            if (containerRef.current) {
              gsap.to(containerRef.current, {
                backgroundColor: "rgba(0, 0, 0, 1)",
                duration: 1,
                ease: "expo.out",
              });
            }
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReady, isLocked, lockdownDuration]);

  // Setup scroll animations
  useEffect(() => {
    if (!containerRef.current || !contentRef.current || isNearingEnd) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".smooth-wrapper",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".smooth-wrapper",
      start: "top top",
      end: "bottom top",
      scrub: true,
    });

    tl.to(
      contentRef.current,
      {
        opacity: 0,
        scale: 0.95,
        ease: "none",
      },
      0,
    );

    return () => {
      tl.kill();
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isNearingEnd]);

  // Setup visibility animations
  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const shouldShow = !isReady || isLocked || hasStartedCountdown;
    const videoOpacity = isLocked ? 0.8 : hasStartedCountdown ? 0.2 : 0.5;

    gsap.to(containerRef.current, {
      autoAlpha: shouldShow ? 1 : 0,
      duration: 0.8,
      ease: "expo.inOut",
    });

    gsap.to(videoRef.current, {
      opacity: videoOpacity,
      duration: 0.8,
      ease: "expo.inOut",
    });
  }, [isReady, isLocked, hasStartedCountdown]);

  // Setup loading and locked animations
  useEffect(() => {
    // Loading text animation
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

    // Locked text animation
    const lockedElement = document.querySelector('[data-locked="true"]');
    if (lockedElement) {
      gsap.to(lockedElement, {
        opacity: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
    }
  }, [isLocked, isReady]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `00:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        visibility: "visible",
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0 opacity-5">
        {/* <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-5 mix-blend-color-burn"
          muted
          loop
          playsInline
          src="/video/clips/1.mp4"
        /> */}
      </div>

      {/* Content Overlay */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SwipeBlocks>
          <ScrambleText
            text={isLocked ? "ACCESS DENIED" : "WS™"}
            className="font-mono text-4xl font-bold text-white sm:text-6xl md:text-8xl"
            continuous={true}
            scrambleOptions={{
              maxScrambleCount: isLocked ? 8 : 3,
              scrambleChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ™",
            }}
          />
        </SwipeBlocks>
        <div className="flex flex-col items-center gap-2">
          {hasStartedCountdown && !isLocked && (
            <div className="font-mono text-sm text-white/80">
              {formatTime(timeRemaining)}
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            {isLocked ? (
              <>
                <div
                  className="font-mono text-xs text-red-500"
                  data-locked="true"
                >
                  SESSION EXPIRED
                </div>
                <div className="font-mono text-[10px] text-white/30">
                  PLEASE REFRESH TO START A NEW SESSION
                </div>
              </>
            ) : (
              <div
                className="font-mono text-xs text-white/50"
                data-loading="true"
              >
                {!isReady ? "loading..." : "time remaining"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
