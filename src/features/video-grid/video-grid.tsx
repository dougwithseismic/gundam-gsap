import { useEffect, useRef } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { ScrambleText } from "../scramble-effect/scramble-text";
import gsap from "gsap";
import { GUNDAM_VIDEO_ID } from "../../routes";

type GridCell = {
  id: string;
  startTime: number;
  row: number;
  col: number;
};

type MousePosition = {
  x: number;
  y: number;
};

type PlayerInstance = {
  id: string;
  player: YouTubeEvent["target"];
};

type VideoGridProps = {
  gridData: GridCell[];
  seismicData: readonly {
    title: string;
    description: string;
  }[];
};

const VideoGrid = ({ gridData, seismicData }: VideoGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playerInstancesRef = useRef<PlayerInstance[]>([]);
  const intervalRef = useRef<number | null>(null);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  // YouTube player options
  const opts = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: GUNDAM_VIDEO_ID,
      start: 58,
    },
  };

  // Clean up function for animations
  const cleanupAnimations = () => {
    animationsRef.current.forEach((tween) => tween.kill());
    animationsRef.current = [];
  };

  // Store GSAP animations for cleanup
  const createAndStoreAnimation = (
    target: gsap.TweenTarget,
    vars: gsap.TweenVars,
  ) => {
    // Kill any existing tweens on this target
    animationsRef.current = animationsRef.current.filter((tween) => {
      if (tween.targets().includes(target)) {
        tween.kill();
        return false;
      }
      return true;
    });

    const tween = gsap.to(target, {
      ...vars,
      onComplete: () => {
        // Remove this tween from the array when it completes
        const index = animationsRef.current.indexOf(tween);
        if (index > -1) {
          animationsRef.current.splice(index, 1);
        }
      },
    });
    animationsRef.current.push(tween);
    return tween;
  };

  // Calculate distance from mouse to cell center
  const calculateDistance = (cellRect: DOMRect, mousePos: MousePosition) => {
    const cellCenterX = cellRect.left + cellRect.width / 2;
    const cellCenterY = cellRect.top + cellRect.height / 2;
    return Math.sqrt(
      Math.pow(mousePos.x - cellCenterX, 2) +
        Math.pow(mousePos.y - cellCenterY, 2),
    );
  };

  // Clean up function for YouTube players
  const cleanupPlayers = () => {
    playerInstancesRef.current.forEach(({ player }) => {
      try {
        player.destroy();
      } catch (error) {
        console.error("Error destroying player:", error);
      }
    });
    playerInstancesRef.current = [];
  };

  // Handle YouTube player ready
  const handlePlayerReady = (event: YouTubeEvent, index: number) => {
    playerInstancesRef.current[index] = {
      id: `youtube-player-${index}`,
      player: event.target,
    };
  };

  // Mouse move effect
  useEffect(() => {
    let rafId: number | null = null;
    let lastMousePos = { x: 0, y: 0 };
    const MOUSE_MOVE_THRESHOLD = 5;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      if (rafId !== null) return;

      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const hasMovedEnough =
        Math.sqrt(dx * dx + dy * dy) >= MOUSE_MOVE_THRESHOLD;

      if (!hasMovedEnough) return;

      const newMousePos = { x: e.clientX, y: e.clientY };
      lastMousePos = newMousePos;

      rafId = requestAnimationFrame(() => {
        const gridRect = gridRef.current!.getBoundingClientRect();

        cellRefs.current.forEach((cellRef, index) => {
          if (!cellRef) return;

          const cellRect = cellRef.getBoundingClientRect();
          const distance = calculateDistance(cellRect, newMousePos);
          const maxDistance = Math.sqrt(
            gridRect.width ** 2 + gridRect.height ** 2,
          );
          const isNear = distance < maxDistance * 0.1;

          const iframeId = `youtube-player-${index}`;
          const iframe = document.getElementById(iframeId);
          const labelId = `pilot-label-${index}`;
          const label = document.getElementById(labelId);

          if (iframe) {
            const glowBg = cellRef.querySelector(".video-glow-bg");
            createAndStoreAnimation(iframe, {
              scale: isNear ? 1.2 : 1,
              opacity: isNear ? 1 : 0,
              filter: isNear
                ? "grayscale(0%) brightness(100%)"
                : "grayscale(100%) brightness(50%)",
              duration: isNear ? 0.8 : 1.5,
              ease: isNear ? "expo.out" : "power2.out",
            });

            if (glowBg) {
              createAndStoreAnimation(glowBg, {
                opacity: isNear ? 1 : 0,
                scale: isNear ? 1.3 : 1,
                duration: isNear ? 0.8 : 1.5,
                delay: isNear ? 0.1 : 0,
                ease: isNear ? "expo.out" : "power2.out",
              });
            }
          }
          if (label) {
            createAndStoreAnimation(label, {
              opacity: isNear ? 1 : 0,
              y: isNear ? 0 : 20,
              duration: isNear ? 0.8 : 1.5,
              ease: isNear ? "expo.out" : "power2.out",
            });
          }
        });
        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
      cleanupAnimations();
    };
  }, []);

  // Initial cell setup
  useEffect(() => {
    cellRefs.current.forEach((cellRef, index) => {
      if (!cellRef) return;
      const iframe = document.getElementById(`youtube-player-${index}`);
      const label = document.getElementById(`pilot-label-${index}`);
      if (iframe) {
        gsap.set(iframe, {
          opacity: 0,
          filter: "grayscale(100%) brightness(50%)",
        });
      }
      if (label) {
        gsap.set(label, { opacity: 0, y: 20 });
      }
    });

    return () => {
      cleanupAnimations();
    };
  }, []);

  // Timed highlight effect
  useEffect(() => {
    let currentIndex = 0;

    intervalRef.current = window.setInterval(() => {
      const cellRef = cellRefs.current[currentIndex];
      if (cellRef) {
        const iframeElement = cellRef.querySelector("iframe");
        const glowBgElement = cellRef.querySelector(".video-glow-bg");
        const labelElement = cellRef.querySelector(`[id^="pilot-label-"]`);

        if (iframeElement) {
          createAndStoreAnimation(iframeElement, {
            scale: 1.2,
            opacity: 1,
            filter: "grayscale(0%) brightness(100%)",
            duration: 0.8,
            ease: "expo.out",
          });
        }

        if (glowBgElement) {
          createAndStoreAnimation(glowBgElement, {
            opacity: 1,
            scale: 1.3,
            duration: 0.8,
            delay: 0.1,
            ease: "expo.out",
          });
        }

        if (labelElement) {
          createAndStoreAnimation(labelElement, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "expo.out",
          });
        }

        const timeoutId = setTimeout(() => {
          if (iframeElement) {
            createAndStoreAnimation(iframeElement, {
              scale: 1,
              opacity: 0,
              filter: "grayscale(100%) brightness(50%)",
              duration: 1.5,
              ease: "power2.out",
            });
          }

          if (glowBgElement) {
            createAndStoreAnimation(glowBgElement, {
              opacity: 0,
              scale: 1,
              duration: 1.5,
              ease: "power2.out",
            });
          }

          if (labelElement) {
            createAndStoreAnimation(labelElement, {
              opacity: 0,
              y: 20,
              duration: 1.5,
              ease: "power2.out",
            });
          }
        }, 1500);

        return () => clearTimeout(timeoutId);
      }

      currentIndex = (currentIndex + 1) % gridData.length;
    }, 2500);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      cleanupAnimations();
    };
  }, [gridData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPlayers();
      cleanupAnimations();
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="relative grid w-full grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4"
      data-speed="0.8"
    >
      {gridData.map((cell, index) => (
        <div
          key={cell.id}
          ref={(el) => (cellRefs.current[index] = el)}
          className="relative flex transform-gpu items-center justify-center overflow-hidden"
          style={{
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {/* Glow Background */}
          <div
            className="video-glow-bg absolute inset-0 opacity-0 transition-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 70%, rgba(147,51,234,0) 100%)",
              transform: "translateZ(-1px)",
            }}
          />
          <div className="video-wrapper relative aspect-video h-full w-full overflow-hidden">
            <YouTube
              videoId={GUNDAM_VIDEO_ID}
              opts={{
                ...opts,
                playerVars: {
                  ...opts.playerVars,
                  start: cell.startTime,
                },
              }}
              className="pointer-events-none absolute inset-0"
              iframeClassName={`absolute inset-0 h-full w-full origin-center transition-all duration-300`}
              id={`youtube-player-${index}`}
              onReady={(e: YouTubeEvent) => handlePlayerReady(e, index)}
            />
          </div>
          {/* Solution Label */}
          <div
            id={`pilot-label-${index}`}
            className="pointer-events-none absolute bottom-4 left-4 flex flex-col opacity-0"
          >
            <div className="flex flex-col gap-1">
              <ScrambleText
                text={seismicData[index]?.title || "INNOVATION"}
                className="font-mono text-xs text-white"
                continuous={true}
                scrambleOptions={{
                  maxScrambleCount: 1,
                }}
              />
              <ScrambleText
                text={seismicData[index]?.description || "Digital Solutions"}
                className="font-mono text-sm font-bold text-white"
                continuous={true}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
