import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { GundamTagline } from "../features/animations/ws/gundam-tagline";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { ScrambleText } from "../features/scramble-effect/scramble-text";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Add this type for our grid cell data
type GridCell = {
  id: string;
  startTime: number;
  row: number;
  col: number;
};

// Add these new types and helper functions at the top
type MousePosition = {
  x: number;
  y: number;
};

// First, add this type to track player instances
type PlayerInstance = {
  id: string;
  player: any; // YouTube player instance
};

// Add this data at the top level
const GUNDAM_DATA = [
  { pilot: "HEERO YUY", suit: "WING GUNDAM ZERO" },
  { pilot: "DUO MAXWELL", suit: "GUNDAM DEATHSCYTHE" },
  { pilot: "TROWA BARTON", suit: "GUNDAM HEAVYARMS" },
  { pilot: "QUATRE WINNER", suit: "GUNDAM SANDROCK" },
  { pilot: "CHANG WUFEI", suit: "GUNDAM SHENLONG" },
  { pilot: "ZECHS MERQUISE", suit: "TALLGEESE" },
  { pilot: "TREIZE KHUSHRENADA", suit: "EPYON" },
  { pilot: "LUCREZIA NOIN", suit: "TAURUS" },
  { pilot: "LADY UNE", suit: "LEO" },
  { pilot: "OTTO", suit: "ARIES" },
  { pilot: "MUELLER", suit: "TRAGOS" },
  { pilot: "ALEX", suit: "PISCES" },
] as const;

const Index = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const storyTextRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const hitMiddleRef = useRef(false);

  // Section Refs
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const sectionThreeRef = useRef<HTMLDivElement>(null);
  const sectionFourRef = useRef<HTMLDivElement>(null);
  const sectionFiveRef = useRef<HTMLDivElement>(null);
  const sectionSixRef = useRef<HTMLDivElement>(null);
  const sectionSevenRef = useRef<HTMLDivElement>(null);

  // New refs for text elements we want to animate in sections 2, 3, and 4
  const sectionTwoTextRef = useRef<HTMLHeadingElement>(null);
  const sectionThreeTextRef = useRef<HTMLHeadingElement>(null);
  const sectionFourTextRef = useRef<HTMLHeadingElement>(null);

  const [isVideoReady, setIsVideoReady] = useState(false);
  // Generate grid data instead of random cards
  const gridData = useMemo(() => {
    const cells: GridCell[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        cells.push({
          id: `cell-${row}-${col}`,
          startTime: Math.floor(Math.random() * 50) + 10,
          row,
          col,
        });
      }
    }
    return cells;
  }, []);

  // Add these new states and refs
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Add ref to track player instances
  const playerInstancesRef = useRef<PlayerInstance[]>([]);

  // First, add a new ref for the text overlay
  const sectionFiveTextRef = useRef<HTMLDivElement>(null);

  // Add this new function to calculate distance from mouse to cell center
  const calculateDistance = (cellRect: DOMRect, mousePos: MousePosition) => {
    const cellCenterX = cellRect.left + cellRect.width / 2;
    const cellCenterY = cellRect.top + cellRect.height / 2;
    return Math.sqrt(
      Math.pow(mousePos.x - cellCenterX, 2) +
        Math.pow(mousePos.y - cellCenterY, 2),
    );
  };

  // Throttle mousemove updates using requestAnimationFrame
  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      const newMousePos = { x: e.clientX, y: e.clientY };

      if (rafId !== null) return;

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
            gsap.to(iframe, {
              scale: isNear ? 1.2 : 1,
              opacity: isNear ? 1 : 0,
              filter: isNear
                ? "grayscale(0%) brightness(100%)"
                : "grayscale(100%) brightness(50%)",
              duration: isNear ? 0.8 : 1.5,
              ease: isNear ? "expo.out" : "power2.out",
            });
            gsap.to(glowBg, {
              opacity: isNear ? 1 : 0,
              scale: isNear ? 1.3 : 1,
              duration: isNear ? 0.8 : 1.5,
              delay: isNear ? 0.1 : 0,
              ease: isNear ? "expo.out" : "power2.out",
            });
          }
          if (label) {
            gsap.to(label, {
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
    };
  }, []);

  useEffect(() => {
    // Create smooth scroller
    const smoother = ScrollSmoother.create({
      wrapper: smoothWrapperRef.current,
      content: smoothContentRef.current,
      smooth: 1.5,
      effects: true,
    });

    gsap.set(videoContainerRef.current, {
      filter: "grayscale(100%)",
      width: "0%",
      height: "60%",
      transformOrigin: "center left",
    });

    if (!isVideoReady) return;

    // Immediate animations chained in timeline
    const immediateTimeline = gsap.timeline();
    immediateTimeline
      .to(videoContainerRef.current, {
        delay: 0.5,
        width: "30%",
        height: "100%",
        duration: 0.7,
        ease: "expo.inOut",
      })
      .to(videoContainerRef.current, {
        filter: "grayscale(0%)",
        width: "100%",
        duration: 0.7,
        ease: "expo.inOut",
      });

    // Timeline for scroll effects on video container
    const indexTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#index",
        start: "top top",
        end: "bottom 40%",
        scrub: true,
        markers: false,
      },
    });

    indexTimeline.to("#pilot-card", {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    // SECTION ONE
    const sectionOneTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionOneRef.current,
        start: "top top",
        end: "bottom 20%",
        scrub: true,
        markers: false,
      },
    });

    sectionOneTimeline.to(videoContainerRef.current, {
      width: "80%",
      height: "60%",
      xPercent: -50,
      yPercent: -50,
      left: "50%",
      top: "50%",
      scale: 1,
    });

    // SECTION TWO (video animations already exist)
    const sectionTwoTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionTwoRef.current,
        start: "top top",
        end: "bottom 20%",
        scrub: true,
        markers: false,
      },
    });

    sectionTwoTimeline
      .to(videoContainerRef.current, {
        width: "40%",
        height: "30%",
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "50%",
        duration: 1,
        filter: "grayscale(100%)",
        ease: "power2.inOut",
        transformOrigin: "center center",
        opacity: 0.2,
      })
      .to(
        "#background-video",
        {
          width: "100%",
          height: "100%",
          scale: 1,
        },
        "<",
      );

    // New text animation for SECTION TWO
    const sectionTwoTextTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionTwoRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });
    sectionTwoTextTimeline.fromTo(
      sectionTwoTextRef.current,
      { scale: 0.8, filter: "grayscale(100%)" },
      { scale: 1.2, filter: "grayscale(0%)", ease: "power2.inOut" },
    );

    // SECTION THREE (video animations)
    const sectionThreeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionThreeRef.current,
        start: "top top",
        end: "bottom 20%",
        scrub: true,
        markers: false,
        onUpdate: (self) => {
          if (self.progress >= 0.5 && !hitMiddleRef.current) {
            console.log("Timeline is halfway!");
            sectionThreeTimeline.to(videoContainerRef.current, {
              width: "95%",
              height: "95%",
              filter: "grayscale(0%)",
              opacity: 1,
              scale: 1,
            });
            hitMiddleRef.current = true;
          } else if (self.progress < 0.5) {
            hitMiddleRef.current = false;
          }
          if (self.progress >= 1) {
            sectionThreeTimeline.to(videoContainerRef.current, {
              opacity: 1,
            });
          }
        },
      },
    });

    sectionThreeTimeline.to(videoContainerRef.current, {
      width: "100%",
      height: "100%",
      scale: 1,
    });

    // New text animation for SECTION THREE
    const sectionThreeTextTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionThreeRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });
    sectionThreeTextTimeline.fromTo(
      sectionThreeTextRef.current,
      { scale: 0.8, filter: "grayscale(100%)" },
      { scale: 1.2, filter: "grayscale(0%)", ease: "power2.inOut" },
    );

    // SECTION FOUR text animation
    const sectionFourTextTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionFourRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });
    sectionFourTextTimeline.fromTo(
      sectionFourTextRef.current,
      { scale: 0.8, filter: "grayscale(100%)" },
      { scale: 1.2, filter: "grayscale(0%)", ease: "power2.inOut" },
    );

    // --- SECTION FIVE: Video Grid with Parallax ---
    const sectionFiveTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionFiveRef.current,
        start: "top 80%",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Animate the main video container
    sectionFiveTimeline
      .to(
        videoContainerRef.current,
        {
          filter: "grayscale(100%) blur(8px)",
          opacity: 0.3,
          ease: "power2.inOut",
        },
        0,
      )
      // Animate in the text overlay
      .fromTo(
        sectionFiveTextRef.current,
        {
          opacity: 0,
          y: 100,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        ">-0.5",
      )
      // Animate out the text overlay
      .to(
        sectionFiveTextRef.current,
        {
          opacity: 0,
          y: -100,
          duration: 1,
          ease: "power2.inOut",
        },
        ">2",
      );

    // --- SECTION SIX: Main video animation ---
    const sectionSixTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionSixRef.current,
        start: "top 80%",
        end: "center center",
        scrub: 1,
      },
    });

    // Main video returns more dramatically
    sectionSixTimeline.to(
      videoContainerRef.current,
      {
        filter: "grayscale(0%) blur(0px)",
        opacity: 1,
        scale: 1.1,
        duration: 1,
        ease: "power2.inOut",
      },
      "<0.3",
    );

    return () => {
      smoother.kill();
    };
  }, [isVideoReady]);

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
  }, []);

  // VIDEO CLIPPER
  // useVideoClipper({ isVideoReady, containerRef: videoContainerRef });

  // Update the onPlayerReady callback
  const handlePlayerReady = useCallback(
    ({ event, index }: { event: YouTubeEvent; index: number }) => {
      event.target.playVideo();
      event.target.mute();
      if (index === 0) {
        setIsVideoReady(true);
      }

      // Store player instance
      playerInstancesRef.current[index] = {
        id: `youtube-player-${index}`,
        player: event.target,
      };
    },
    [],
  );

  const opts = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: "8-qzOpE3dyM",
      start: 58,
    },
  };

  return (
    <>
      {/* BACKGROUND VIDEO */}
      <div
        ref={videoContainerRef}
        className="pointer-events-none fixed top-0 left-0 z-0 flex h-0 w-0 flex-col items-center justify-center overflow-clip bg-primary-100"
      >
        <motion.div
          id="background-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="pointer-events-none absolute inset-0 z-10 min-h-svh min-w-svw"
        >
          <YouTube
            videoId="8-qzOpE3dyM"
            opts={opts}
            onReady={(e: YouTubeEvent) =>
              handlePlayerReady({ event: e, index: 0 })
            }
            className="pointer-events-none"
            iframeClassName="pointer-events-none z-10 min-h-svh min-w-svw scale-[1.2] opacity-100"
          />
        </motion.div>
      </div>

      {/* PILOT CARD */}
      <div
        id="pilot-card"
        className="h- fixed right-4 bottom-12 z-20 ml-auto h-fit w-full max-w-xs"
      >
        <div className="absolute inset-0 bg-primary-400 opacity-80 mix-blend-darken"></div>
        <div
          ref={cardRef}
          className="relative grid h-fit w-full grid-cols-12 bg-gradient-to-br from-[var(--color-primary-400/10)] to-primary-300 p-4 font-mono"
        >
          <div className="col-span-6">
            <SwipeBlocks>PILOT STATUS</SwipeBlocks>
          </div>
          <div className="col-span-6 flex justify-end">
            <SwipeBlocks>ACTIVE</SwipeBlocks>
          </div>
          <div className="col-span-4 text-text-muted">
            <SwipeBlocks to="left" from="left">
              COMBAT READY
            </SwipeBlocks>
          </div>
          <div className="col-span-6 col-start-7 text-right text-text-muted">
            <SwipeBlocks to="right" from="right">
              SYSTEMS NOMINAL
            </SwipeBlocks>
          </div>
          <div className="col-span-12 mt-8 flex justify-end text-text-muted">
            <GundamTagline />
          </div>
        </div>
      </div>

      {/* Smooth scroll wrapper */}
      <div ref={smoothWrapperRef} className="smooth-wrapper">
        <div ref={smoothContentRef} className="smooth-content">
          <div
            ref={sectionOneRef}
            id="index"
            className="relative flex h-screen min-h-screen flex-col"
          >
            {/* STORY TEXT */}
            <div
              ref={storyTextRef}
              className="relative z-10 mt-auto mb-12 ml-4 flex max-w-lg flex-col gap-4"
            >
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.5, delayChildren: 2 }}
                className="flex flex-col gap-4"
              >
                <motion.div
                  className="sidequest-text"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* <SwipeBlocks to="left" from="left">
                    <ScrambleText
                      continuous={true}
                      text="A time of conflict grips the Earth Sphere. The militaristic ALLIANCE maintains its iron grip over the space colonies through force and intimidation. In a desperate bid for freedom, five mysterious pilots have been dispatched to Earth, each commanding a powerful mobile suit known as a GUNDAM."
                    />
                  </SwipeBlocks> */}
                </motion.div>
                <motion.div
                  className="sidequest-text"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </motion.div>
            </div>
          </div>

          {/* SECTION TWO */}
          <div
            ref={sectionTwoRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2
              ref={sectionTwoTextRef}
              className="z-50 text-center text-6xl text-white"
            >
              EPISODE AC 195
              <br />
              OPERATION METEOR
            </h2>
          </div>

          {/* SECTION THREE */}
          <div
            ref={sectionThreeRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2
              ref={sectionThreeTextRef}
              className="z-50 max-w-xl text-justify text-xs text-white"
            >
              <SwipeBlocks to="left" from="left">
                <ScrambleText
                  continuous={true}
                  text="A time of conflict grips the Earth Sphere. The militaristic ALLIANCE maintains its iron grip over the space colonies through force and intimidation. In a desperate bid for freedom, five mysterious pilots have been dispatched to Earth, each commanding a powerful mobile suit known as a GUNDAM."
                />
              </SwipeBlocks>
            </h2>
          </div>

          {/* SECTION FOUR */}
          <div
            ref={sectionFourRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2
              ref={sectionFourTextRef}
              className="z-50 max-w-xl text-justify text-xs text-white"
            >
              <SwipeBlocks delay={0.1} to="left" from="left">
                <ScrambleText
                  continuous={true}
                  text="Their mission: to strike at the heart of the Alliance's power and free the colonies from tyranny. As these young warriors descend through Earth's atmosphere, none can predict how their arrival will forever alter the balance of power between Earth and the colonies...."
                />
              </SwipeBlocks>
            </h2>
          </div>

          {/* SECTION FIVE - Video Grid Layout */}
          <div
            ref={sectionFiveRef}
            className="relative flex h-screen items-center justify-center bg-black"
          >
            {/* Text Overlay */}
            <div
              ref={sectionFiveTextRef}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white"
            >
              <div className="flex flex-col items-center gap-8">
                <SwipeBlocks>
                  <h2 className="text-6xl font-bold">MOBILE SUIT DATABASE</h2>
                </SwipeBlocks>
                <SwipeBlocks delay={0.2}>
                  <p className="max-w-xl text-center font-mono text-sm">
                    ACCESSING CLASSIFIED RECORDS... OPERATION METEOR PILOT DATA
                  </p>
                </SwipeBlocks>
              </div>
            </div>

            {/* Video Grid */}
            <div
              ref={gridRef}
              className="relative grid w-full grid-cols-4 grid-rows-3 gap-1"
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
                      videoId="8-qzOpE3dyM"
                      opts={{
                        ...opts,
                        playerVars: {
                          ...opts.playerVars,
                          start: cell.startTime,
                        },
                      }}
                      onReady={(e: YouTubeEvent) =>
                        handlePlayerReady({ event: e, index })
                      }
                      className="pointer-events-none absolute inset-0"
                      iframeClassName={`absolute inset-0 h-full w-full origin-center transition-all duration-300`}
                      id={`youtube-player-${index}`}
                    />
                  </div>
                  {/* Pilot and Mobile Suit Label */}
                  <div
                    id={`pilot-label-${index}`}
                    className="pointer-events-none absolute bottom-4 left-4 flex flex-col opacity-0"
                  >
                    <div className="flex flex-col gap-1">
                      <ScrambleText
                        text={GUNDAM_DATA[index]?.pilot || "UNKNOWN PILOT"}
                        className="font-mono text-xs text-white"
                        continuous={true}
                      />
                      <ScrambleText
                        text={GUNDAM_DATA[index]?.suit || "UNKNOWN UNIT"}
                        className="font-mono text-sm font-bold text-white"
                        continuous={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION SIX */}
          <div
            ref={sectionSixRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Six</h2>
          </div>

          {/* SECTION SEVEN */}
          <div
            ref={sectionSevenRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Seven</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});

export default Index;
