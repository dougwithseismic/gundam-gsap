import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useAnimationCleanup } from "../animations/hooks/use-animation-cleanup";
import { ScrambleText } from "../scramble-effect/scramble-text";
import { debounce } from "../utils/debounce";

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

type MousePosition = {
  x: number;
  y: number;
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

const RANDOM_TRIGGER_INTERVAL = 3000; // Time between random triggers (3 seconds)
const TRIGGER_DURATION = 2000; // How long an item stays triggered (2 seconds)
const MIN_OPACITY = 0.05; // Minimum opacity for inactive elements

const VideoGrid = ({ gridData, seismicData }: VideoGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cellActiveStates = useRef<boolean[]>([]);
  const gridRectRef = useRef<DOMRect | null>(null);
  const cellRectsRef = useRef<(DOMRect | null)[]>([]);
  const activeTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Generate random unique video indices for each cell
  const videoIndices = useRef<number[]>(
    getShuffledVideoIndices(gridData.length),
  );

  const {
    trackInterval,
    trackListener,
    cleanup: cleanupAnimations,
  } = useAnimationCleanup();

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

  // Modified triggerCell function that uses self-cleaning timelines
  const triggerCell = useCallback(
    (
      index: number,
      isNear: boolean,
      cellRef: HTMLDivElement,
      video: HTMLVideoElement | null,
      label: HTMLElement | null,
      duration: number = 800,
    ) => {
      // If already in the desired state, skip
      if (cellActiveStates.current[index] === isNear) return;
      cellActiveStates.current[index] = isNear;

      // Create a timeline for this cell's animation that cleans itself up
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill(); // Kill timeline once done to free up memory
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

      // If this was triggered randomly, schedule its return to normal state
      if (!isNear) return;

      // Clear any existing timeout for this index
      const existingTimeout = activeTimeoutsRef.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set timeout to revert the cell's state after TRIGGER_DURATION
      const timeoutId = setTimeout(() => {
        triggerCell(index, false, cellRef, video, label, duration);
        activeTimeoutsRef.current.delete(index);
      }, TRIGGER_DURATION);

      activeTimeoutsRef.current.set(index, timeoutId);
    },
    [],
  );

  // Mouse move effect
  useEffect(() => {
    let rafId: number | null = null;
    let lastMousePos = { x: 0, y: 0 };
    const MOUSE_MOVE_THRESHOLD = 5;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRectRef.current || rafId !== null) return;

      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const hasMovedEnough =
        Math.sqrt(dx * dx + dy * dy) >= MOUSE_MOVE_THRESHOLD;

      if (!hasMovedEnough) return;

      const newMousePos = { x: e.clientX, y: e.clientY };
      lastMousePos = newMousePos;

      rafId = requestAnimationFrame(() => {
        cellRefs.current.forEach((cellRef, index) => {
          if (!cellRef || !cellRectsRef.current[index]) return;

          const cellRect = cellRectsRef.current[index]!;
          const distance = calculateDistance(cellRect, newMousePos);
          const maxDistance = Math.sqrt(
            gridRectRef.current!.width ** 2 + gridRectRef.current!.height ** 2,
          );
          const isNear = distance < maxDistance * 0.1;

          const video = videoRefs.current[index];
          const labelId = `pilot-label-${index}`;
          const label = document.getElementById(labelId);

          triggerCell(index, isNear, cellRef, video, label);
        });
        rafId = null;
      });
    };

    trackListener(window, "mousemove", handleMouseMove as EventListener);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      cleanupAnimations();
    };
  }, [triggerCell, trackListener, cleanupAnimations]);

  // Random trigger effect
  useEffect(() => {
    const triggerRandomCell = () => {
      // Get indices of cells that aren't currently active
      const inactiveIndices = cellRefs.current
        .map((_, index) => index)
        .filter(
          (index) =>
            !cellActiveStates.current[index] &&
            !activeTimeoutsRef.current.has(index),
        );

      if (inactiveIndices.length === 0) return;

      // Select one random cell
      const randomIndex =
        inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
      const cellRef = cellRefs.current[randomIndex];
      const video = videoRefs.current[randomIndex];
      const label = document.getElementById(`pilot-label-${randomIndex}`);

      if (cellRef) {
        triggerCell(randomIndex, true, cellRef, video, label, TRIGGER_DURATION);
      }
    };

    // Start the interval
    trackInterval(setInterval(triggerRandomCell, RANDOM_TRIGGER_INTERVAL));

    return () => {
      // Capture the current timeouts at the time of cleanup
      const currentTimeouts = new Map(activeTimeoutsRef.current);
      // Clear all active timeouts on cleanup
      currentTimeouts.forEach((timeout) => clearTimeout(timeout));
      currentTimeouts.clear();
      cleanupAnimations();
    };
  }, [triggerCell, trackInterval, cleanupAnimations]);

  // Initial cell setup
  useLayoutEffect(() => {
    gsap.context(() => {
      cellRefs.current.forEach((cellRef, index) => {
        if (!cellRef) return;
        const video = videoRefs.current[index];
        const label = document.getElementById(`pilot-label-${index}`);
        if (video) {
          video.src = videoUrls[videoIndices.current[index]];
          gsap.set(video, {
            opacity: MIN_OPACITY,
            filter: "grayscale(100%) brightness(50%)",
          });
        }
        if (label) {
          gsap.set(label, { opacity: MIN_OPACITY, y: 20 });
        }
      });

      // Start all videos
      videoRefs.current.forEach((video) => {
        if (video) {
          video.play().catch(console.error);
        }
      });
    });
  }, []);

  // Calculate distance from mouse to cell center
  const calculateDistance = (cellRect: DOMRect, mousePos: MousePosition) => {
    const cellCenterX = cellRect.left + cellRect.width / 2;
    const cellCenterY = cellRect.top + cellRect.height / 2;
    return Math.sqrt(
      Math.pow(mousePos.x - cellCenterX, 2) +
        Math.pow(mousePos.y - cellCenterY, 2),
    );
  };

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
          className="relative flex aspect-[16/9] transform-gpu items-center justify-center overflow-hidden"
          style={{
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {/* Glow Background */}
          <div
            className="video-glow-bg absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 70%, rgba(147,51,234,0) 100%)",
              transform: "translateZ(-1px)",
            }}
          />
          <div className="relative h-full w-full">
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              className="h-full w-full object-cover"
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
                scrambleOptions={{
                  maxScrambleCount: 1,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
