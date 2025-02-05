import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useAnimationCleanup } from "../animations/hooks/use-animation-cleanup";
import { debounce } from "../utils/debounce";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Generate video URLs for all clips
const generateVideoUrls = () => {
  const urls: string[] = [];
  for (let i = 1; i <= 20; i++) {
    urls.push(`/video/clips/${i}.mp4`); // Simple root absolute path
  }
  return urls;
};

const videoUrls = generateVideoUrls();

type GridCell = {
  id: string;
  videoIndex: number;
  row: number;
  col: number;
};

type VideoGridProps = {
  gridData: GridCell[];
  seismicData: readonly {
    title: string;
    description: string;
  }[];
};

// Function to get shuffled video indices
const getShuffledVideoIndices = (count: number) => {
  const indices = Array.from({ length: videoUrls.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
};

const RANDOM_TRIGGER_INTERVAL = 2000; // Time between random triggers (3 seconds)
const TRIGGER_DURATION = 3000; // How long an item stays triggered (2 seconds)
const MIN_OPACITY = 0.05; // Minimum opacity for inactive elements

// Update the type to track trigger source
type CellState = {
  isActive: boolean;
  triggerSource: "hover" | "random" | null;
};

const VideoGrid = ({ gridData, seismicData }: VideoGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  // Update cell states to track trigger source
  const cellStates = useRef<CellState[]>(
    Array(gridData.length).fill({ isActive: false, triggerSource: null }),
  );
  const gridRectRef = useRef<DOMRect | null>(null);
  const cellRectsRef = useRef<(DOMRect | null)[]>([]);
  const activeTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Generate random unique video indices for each cell
  const videoIndices = useRef<number[]>(
    getShuffledVideoIndices(gridData.length),
  );

  const { trackInterval, cleanup: cleanupAnimations } = useAnimationCleanup();

  // Cache grid and cell rects
  useLayoutEffect(() => {
    const updateRects = () => {
      if (gridRef.current) {
        gridRectRef.current = gridRef.current.getBoundingClientRect();
        cellRectsRef.current = cellRefs.current.map((cell) =>
          cell ? cell.getBoundingClientRect() : null,
        );
      }
    };

    updateRects();

    const debouncedUpdateRects = debounce(updateRects, 250);
    window.addEventListener("resize", debouncedUpdateRects);
    window.addEventListener("scroll", debouncedUpdateRects);

    return () => {
      window.removeEventListener("resize", debouncedUpdateRects);
      window.removeEventListener("scroll", debouncedUpdateRects);
      debouncedUpdateRects.cancel();
    };
  }, []);

  // Modified triggerCell function that handles trigger sources
  const triggerCell = useCallback(
    (
      index: number,
      isNear: boolean,
      cellRef: HTMLDivElement,
      video: HTMLVideoElement | null,
      label: HTMLElement | null,
      duration: number = 800,
      source: "hover" | "random" = "hover",
    ) => {
      const currentState = cellStates.current[index];

      // Only prevent updates if the cell is already active with the same source
      // This allows hover to take over from random, and random to activate non-hovered cells
      if (
        currentState.isActive &&
        currentState.triggerSource === source &&
        isNear === true
      )
        return;

      // If cell is already active from hover, don't let random override it
      if (
        currentState.isActive &&
        currentState.triggerSource === "hover" &&
        source === "random"
      )
        return;

      // Update state - preserve random timer if hover is taking over
      const preserveTimeout =
        currentState.triggerSource === "random" && source === "hover";
      if (!preserveTimeout) {
        cellStates.current[index] = {
          isActive: isNear,
          triggerSource: isNear ? source : null,
        };
      }

      // Create a timeline for this cell's animation that cleans itself up
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });

      const glowBg = cellRef.querySelector(".video-glow-bg");

      if (video && glowBg) {
        tl.to([video, glowBg], {
          scale: isNear ? 1.2 : 1,
          opacity: isNear ? 1 : MIN_OPACITY,
          duration: duration / 1000,
          ease: isNear ? "expo.out" : "power2.out",
        })
          .to(
            video,
            {
              filter: isNear
                ? "grayscale(0%) brightness(100%)"
                : "grayscale(100%) brightness(50%)",
              duration: duration / 1000,
              ease: isNear ? "expo.out" : "power2.out",
            },
            "<",
          )
          .to(
            glowBg,
            {
              scale: isNear ? 1.3 : 1,
              duration: duration / 1000,
              ease: isNear ? "expo.out" : "power2.out",
            },
            "<",
          );
      }

      if (label) {
        tl.to(
          label,
          {
            opacity: isNear ? 1 : MIN_OPACITY,
            y: isNear ? 0 : 20,
            duration: duration / 1000,
            ease: isNear ? "expo.out" : "power2.out",
          },
          "<0.1",
        );
      }

      // Only handle timeouts for random triggers
      if (!isNear || source !== "random") return;

      // Clear any existing timeout for this index
      const existingTimeout = activeTimeoutsRef.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set timeout to revert the cell's state after TRIGGER_DURATION
      const timeoutId = setTimeout(() => {
        // Only revert if not currently being hovered
        if (cellStates.current[index].triggerSource !== "hover") {
          triggerCell(index, false, cellRef, video, label, duration, source);
        }
        activeTimeoutsRef.current.delete(index);
      }, TRIGGER_DURATION);

      activeTimeoutsRef.current.set(index, timeoutId);
    },
    [],
  );

  // Update video initialization
  useLayoutEffect(() => {
    gsap.context(() => {
      cellRefs.current.forEach((cellRef, index) => {
        if (!cellRef) return;
        const video = videoRefs.current[index];
        const label = document.getElementById(`pilot-label-${index}`);
        if (video) {
          // Set preload attribute and event listener. Video src will be set later with a staggered delay.
          video.preload = "auto"; // Add preload

          // Add smooth loop handling
          video.addEventListener("ended", () => {
            video.currentTime = 0;
            video.play().catch(console.error);
          });

          gsap.set(video, {
            opacity: MIN_OPACITY,
            filter: "grayscale(100%) brightness(50%)",
            mixBlendMode: "multiply",
          });
        }
        if (label) {
          gsap.set(label, { opacity: MIN_OPACITY, y: 20 });
        }
      });

      // Stagger video loading: load each video with a delay based on its index
      const staggerDelay = 0.3; // seconds delay between each video's load
      videoRefs.current.forEach((video, index) => {
        gsap.delayedCall(index * staggerDelay, () => {
          if (video) {
            video.src = videoUrls[videoIndices.current[index]];
            video.play().catch(console.error);
          }
        });
      });
    });

    // Capture current videos for cleanup
    const currentVideos = videoRefs.current;

    // Cleanup video event listeners
    return () => {
      currentVideos.forEach((video) => {
        if (video) {
          video.removeEventListener("ended", () => {});
        }
      });
    };
  }, []);

  // Update random trigger effect to use new source
  useEffect(() => {
    const timeoutsRef = activeTimeoutsRef.current;

    const triggerRandomCell = () => {
      // Get indices of cells that aren't currently active or are only random-triggered
      const availableIndices = cellRefs.current
        .map((_, index) => index)
        .filter(
          (index) =>
            !cellStates.current[index].isActive ||
            (cellStates.current[index].triggerSource === "random" &&
              !timeoutsRef.has(index)),
        );

      if (availableIndices.length === 0) return;

      const randomIndex =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const cellRef = cellRefs.current[randomIndex];
      const video = videoRefs.current[randomIndex];
      const label = document.getElementById(`pilot-label-${randomIndex}`);

      if (cellRef) {
        // Pass 'random' as source
        triggerCell(
          randomIndex,
          true,
          cellRef,
          video,
          label,
          TRIGGER_DURATION,
          "random",
        );
      }
    };

    // Start the interval
    trackInterval(setInterval(triggerRandomCell, RANDOM_TRIGGER_INTERVAL));

    return () => {
      // Clear all active timeouts on cleanup using the captured ref
      timeoutsRef.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.clear();
      cleanupAnimations();
    };
  }, [triggerCell, trackInterval, cleanupAnimations]);

  // Grid stagger fade in animation with quick grey border effect when cells come into view
  useLayoutEffect(() => {
    const cells = cellRefs.current.filter((cell) => cell) as HTMLElement[];
    if (!cells.length) return;
    // Set initial style for fade-in and border animation
    gsap.set(cells, {
      opacity: 0,
      background: "radial-gradient(circle, black, black)",
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 80%",
        once: true,
      },
    });
    tl.to(cells, {
      opacity: 0.3,
      stagger: 0.05,
      duration: 0.25,
      ease: "power1.out",
    })
      .to(
        cells,
        {
          background: "radial-gradient(circle, rebeccapurple, black)",
          mixBlendMode: "screen",
          stagger: 0.05,
          opacity: 0.5,
          duration: 0.1,
          ease: "power1.out",
        },
        "+=0.05",
      )
      .to(cells, {
        background: "radial-gradient(circle, black, black)",
        mixBlendMode: "normal",
        stagger: 0.05,
        opacity: 1,
        duration: 0.1,
        ease: "power1.out",
      })
      .add(() => {
        videoRefs.current.forEach((video) => {
          if (video) video.style.mixBlendMode = "inherit";
        });
      });
    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  // Add cursor animation effect
  useEffect(() => {
    if (!cursorRef.current || !gridRef.current) return;

    const cursor = cursorRef.current;
    const grid = gridRef.current;
    let cursorAnimation: gsap.core.Tween;

    const onMouseEnter = () => {
      gsap.to(cursor, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (cursorAnimation) {
        cursorAnimation.kill();
      }

      cursorAnimation = gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.15,
        ease: "power2.out",
      });
    };

    grid.addEventListener("mouseenter", onMouseEnter);
    grid.addEventListener("mouseleave", onMouseLeave);
    grid.addEventListener("mousemove", onMouseMove);

    return () => {
      grid.removeEventListener("mouseenter", onMouseEnter);
      grid.removeEventListener("mouseleave", onMouseLeave);
      grid.removeEventListener("mousemove", onMouseMove);
      if (cursorAnimation) cursorAnimation.kill();
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="relative z-10 grid w-full origin-center grid-cols-6"
      style={{ cursor: "none" }}
    >
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-[100] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-700/80 opacity-0 mix-blend-difference"
        style={{
          willChange: "transform",
          pointerEvents: "none",
        }}
      />
      {gridData.map((cell, index) => (
        <div
          key={cell.id}
          ref={(el) => (cellRefs.current[index] = el)}
          className="relative flex aspect-video transform-gpu items-center justify-center overflow-hidden"
          style={{
            transformOrigin: "center center",
            willChange: "transform",
            cursor: "none",
            pointerEvents: "auto",
          }}
          onMouseEnter={() => {
            const video = videoRefs.current[index];
            const label = document.getElementById(`pilot-label-${index}`);
            if (cellRefs.current[index]) {
              triggerCell(
                index,
                true,
                cellRefs.current[index]!,
                video,
                label,
                800,
                "hover",
              );
            }
          }}
          onMouseLeave={() => {
            const video = videoRefs.current[index];
            const label = document.getElementById(`pilot-label-${index}`);
            if (cellRefs.current[index]) {
              triggerCell(
                index,
                false,
                cellRefs.current[index]!,
                video,
                label,
                800,
                "hover",
              );
            }
          }}
        >
          {/* Glow Background */}
          <div
            className="video-glow-bg pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 70%, rgba(147,51,234,0) 100%)",
              transform: "translateZ(-1px)",
            }}
          />
          <div className="pointer-events-none relative h-full w-full">
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              className="pointer-events-none h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          </div>
          {/* Label */}
          <div
            id={`pilot-label-${index}`}
            className="pointer-events-none absolute bottom-4 left-4 flex flex-col opacity-0"
          >
            <div className="pointer-events-none flex flex-col gap-1">
              <span className="pointer-events-none font-mono text-xs text-white">
                {seismicData[index]?.title || "INNOVATION"}
              </span>
              <span className="pointer-events-none font-mono text-sm font-bold text-white">
                {seismicData[index]?.description || "Digital Solutions"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
