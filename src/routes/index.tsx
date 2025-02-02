import {
  Anthropic,
  Aws,
  Cursor,
  DeepSeek,
  Github,
  HuggingFace,
  OpenAI,
  Perplexity,
  Vercel,
  XAI,
} from "@lobehub/icons";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { GundamTagline } from "../features/animations/ws/gundam-tagline";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { Preloader } from "../features/preloader/preloader";
import { ScrambleText } from "../features/scramble-effect/scramble-text";
const VideoGrid = lazy(() => import("../features/video-grid/video-grid"));

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Constants
export const GUNDAM_VIDEO_ID = "8-qzOpE3dyM";

// Add this type for our grid cell data
type GridCell = {
  id: string;
  videoIndex: number;
  row: number;
  col: number;
};

// Add this data at the top level
const SEISMIC_DATA = [
  {
    title: "UNFAIR ADVANTAGE",
    description: "Tilting Fields in Your Favor",
  },
  {
    title: "DOPENESS FACTOR",
    description: "Beyond Mediocrity",
  },
  {
    title: "SPEED WINS",
    description: "Ship Now, Perfect Later",
  },
  {
    title: "MAXIMAL RESULTS",
    description: "Minimal Effort, Maximum Impact",
  },
  {
    title: "SYSTEM HACKING",
    description: "Rewriting the Rules",
  },
  {
    title: "RESOURCE MASTERY",
    description: "Efficiency as Power",
  },
  {
    title: "HUMAN MULTIPLIER",
    description: "Exponential Team Growth",
  },
  {
    title: "WIN-WIN DEALS",
    description: "Building Trust & Value",
  },
  {
    title: "DATA DRIVEN",
    description: "Numbers Never Lie",
  },
  {
    title: "PERPETUAL BETA",
    description: "Always Iterating",
  },
  {
    title: "VALUE CREATION",
    description: "Monetization Through Impact",
  },
  {
    title: "TRUE INFLUENCE",
    description: "Authentic Innovation",
  },
] as const;

const Index = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const storyTextRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);

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
          videoIndex: row * 4 + col + 1,
          row,
          col,
        });
      }
    }
    return cells;
  }, []);

  // First, add a new ref for the text overlay
  const sectionFiveTextRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "/video/clips/full.mp4";
      videoRef.current.play().catch(console.error);
    }
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
      willChange: "transform, opacity, filter",
    });

    // Add willChange hints to text elements for smoother animations
    gsap.set(
      [
        sectionTwoTextRef.current,
        sectionThreeTextRef.current,
        sectionFourTextRef.current,
        sectionFiveTextRef.current,
      ],
      { willChange: "transform, opacity, filter" },
    );

    if (!isVideoReady) {
      return () => {
        smoother.kill();
      };
    }

    const ctx = gsap.context(() => {
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

      // SECTION THREE (video animations) - fixed timeline
      const sectionThreeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionThreeRef.current,
          start: "top top",
          end: "bottom 20%",
          scrub: true,
        },
      });
      sectionThreeTimeline
        .to(videoContainerRef.current, {
          width: "95%",
          height: "95%",
          filter: "grayscale(0%)",
          opacity: 1,
          scale: 1,
          duration: 0.5,
        })
        .to(videoContainerRef.current, {
          width: "100%",
          height: "100%",
          scale: 1,
          duration: 0.5,
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
        .to(
          sectionFiveTextRef.current,
          {
            opacity: 0,
            y: -100,
            duration: 1,
            ease: "power2.inOut",
          },
          ">2",
        )
        .to(".video-grid-wrapper", {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        });

      // --- SECTION SIX: Main video animation ---
      const sectionSixTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionSixRef.current,
          start: "top 80%",
          end: "center center",
          scrub: 1,
        },
      });

      sectionSixTimeline.to(
        videoContainerRef.current,
        {
          filter: "grayscale(0%) blur(0px)",
          opacity: 1,
          scale: 1.2,
          duration: 1,
          ease: "power2.inOut",
        },
        "<0.3",
      );

      const sectionSevenTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionSevenRef.current,
          start: "top 80%",
          end: "center center",
          scrub: true,
        },
      });

      sectionSevenTimeline.to(videoContainerRef.current, {
        filter: "grayscale(100%) blur(8px)",
        opacity: 0.3,
        scale: 0.6,
        ease: "power2.inOut",
      });
    });

    return () => {
      ctx.revert();
      smoother.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isVideoReady]);

  return (
    <>
      <Preloader isReady={isVideoReady} />

      {/* BACKGROUND VIDEO */}
      <div
        ref={videoContainerRef}
        className="pointer-events-none fixed top-0 left-0 z-0 flex h-0 w-0 flex-col items-center justify-center overflow-clip bg-primary-100 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary-950/50 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <motion.div
          id="background-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="pointer-events-none absolute inset-0 z-10 min-h-svh min-w-svw"
        >
          <video
            ref={videoRef}
            className="pointer-events-none z-10 min-h-svh min-w-svw scale-[1.2] opacity-100"
            muted
            loop
            playsInline
            autoPlay
            onPlay={() => setIsVideoReady(true)}
          />
        </motion.div>
      </div>

      {/* PILOT CARD */}
      <div
        id="pilot-card"
        className="fixed right-4 bottom-12 z-20 ml-auto w-full max-w-xs sm:max-w-sm"
      >
        <div className="absolute inset-0 bg-primary-400 opacity-80 mix-blend-darken"></div>
        <div
          ref={cardRef}
          className="relative grid h-fit w-full grid-cols-12 bg-gradient-to-br from-[var(--color-primary-400/10)] to-primary-300 p-4 font-mono"
        >
          <div className="col-span-6">
            <SwipeBlocks>REVENUE DRIVEN</SwipeBlocks>
          </div>
          <div className="col-span-6 flex justify-end">
            <SwipeBlocks>OUTREACH AUTOMATION</SwipeBlocks>
          </div>
          <div className="col-span-4 text-text-muted">
            <SwipeBlocks to="left" from="left">
              SKUNKWORKS & AUTOMATION
            </SwipeBlocks>
          </div>
          <div className="col-span-6 col-start-7 text-right text-text-muted">
            <SwipeBlocks to="right" from="right">
              AI ASSISTED DEVELOPMENT
            </SwipeBlocks>
          </div>
          <div className="col-span-12 mt-8 flex justify-end text-text-muted">
            <GundamTagline title="CONTACT" subtitle="HELLO@WITHSEISMIC.COM" />
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
                ></motion.div>
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
            className="relative flex h-screen flex-col items-center justify-center gap-8"
          >
            <h2
              ref={sectionTwoTextRef}
              className="z-50 text-center text-3xl text-white sm:text-4xl md:text-6xl"
            >
              WE BUILD FORCE
              <br />
              MULTIPLIER TOOLS FOR
              <br />
              UNDERDOG PLAYERS THAT
              <br />
              WANT TO WIN.
            </h2>
            <div className="mx-auto my-8 grid grid-cols-3 gap-8 sm:grid-cols-5">
              <Anthropic.Avatar size={48} />
              <OpenAI.Avatar size={48} />
              <DeepSeek.Avatar size={48} />
              <Cursor.Avatar size={48} />
              <HuggingFace.Avatar size={48} />
              <Perplexity.Avatar size={48} />
              <Aws.Avatar size={48} />
              <Github.Avatar size={48} />
              <Vercel.Avatar size={48} />
              <XAI.Avatar size={48} />
            </div>
          </div>

          {/* SECTION THREE */}
          <div
            ref={sectionThreeRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2
              ref={sectionThreeTextRef}
              className="z-50 mx-auto max-w-md text-center text-sm text-white sm:text-base md:text-lg"
            >
              <SwipeBlocks to="left" from="left">
                <ScrambleText
                  continuous={true}
                  text="We don't just play the game — we change the rules. Every unfair advantage is an opportunity, every challenge a chance to forge something impossibly dope. We're the hackers in the garage, the artists with a spreadsheet, the corporate renegades."
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
              className="z-50 mx-auto max-w-md text-center text-sm text-white sm:text-base md:text-lg"
            >
              <SwipeBlocks delay={0.1} to="left" from="left">
                <ScrambleText
                  continuous={true}
                  text="Speed over perfection. We don't just cut corners; we redesign the shape. We eliminate the unnecessary so the necessary may speak. Fast execution beats flawless planning, every single time."
                />
              </SwipeBlocks>
            </h2>
          </div>

          {/* SECTION FIVE - Video Grid Layout */}
          <div
            ref={sectionFiveRef}
            className="relative flex items-center justify-center bg-black"
          >
            {/* Text Overlay */}
            <div
              ref={sectionFiveTextRef}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white"
            >
              <div className="flex flex-col items-center gap-8">
                <SwipeBlocks delay={0.2}>
                  <p className="mx-auto max-w-xs text-center font-mono text-sm sm:max-w-xl">
                    ACCESSING OPTIMIZATION PROTOCOLS... LOADING FORCE
                    MULTIPLIERS
                  </p>
                </SwipeBlocks>
              </div>
            </div>

            {/* Lazy loaded Video Grid */}
            <div className="video-grid-wrapper">
              <Suspense fallback={null}>
                <VideoGrid gridData={gridData} seismicData={SEISMIC_DATA} />
              </Suspense>
            </div>
          </div>

          {/* SECTION SIX */}
          <div
            ref={sectionSixRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 mx-auto max-w-md text-center text-3xl text-white sm:text-4xl md:text-6xl">
              FULLSTACK AI ASSISTED DEVELOPMENT
              <br />
              <span className="mt-4 block text-xl sm:text-2xl md:text-2xl">
                FROM THE HACKERS IN THE BASEMENT
              </span>
            </h2>
          </div>

          {/* SECTION SEVEN */}
          <div
            ref={sectionSevenRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-center text-3xl text-white sm:text-4xl md:text-6xl">
              hello@withseismic.com
            </h2>
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
