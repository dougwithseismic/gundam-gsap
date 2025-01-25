import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { GundamTagline } from "../features/animations/ws/gundam-tagline";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { ScrambleText } from "../features/scramble-effect/scramble-text";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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

  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Create smooth scroller
    const smoother = ScrollSmoother.create({
      wrapper: smoothWrapperRef.current,
      content: smoothContentRef.current,
      smooth: 1.5, // Adjust smoothness (higher = smoother)
      effects: true, // Enables special scroll effects like data-speed
    });

    gsap.set(videoContainerRef.current, {
      filter: "grayscale(100%)",
      width: "0%",
      height: "60%",
      transformOrigin: "center left",
      paused: !isVideoReady,
    });

    if (!isVideoReady) return;

    // Immediate animations chained in timeline
    const immediateTimeline = gsap.timeline();
    immediateTimeline
      .to(videoContainerRef.current, {
        paused: !isVideoReady,
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

    // Timeline for scroll effects
    const indexTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#index",
        start: "top top",
        end: "bottom 40%",
        scrub: true,
        markers: true, // This will help debug the scroll trigger points
      },
    });

    indexTimeline.to("#pilot-card", {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    //  SECTION TWO
    const sectionTwoTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionTwoRef.current,
        start: "top top",
        end: "bottom 20%",
        scrub: true,
        markers: true, // This will help debug the scroll trigger points
      },
    });

    sectionTwoTimeline.to(videoContainerRef.current, {
      opacity: 1,
      duration: 1,
      filter: "grayscale(0%)", // Fade from grayscale to color
      ease: "power2.inOut",
    });

    return () => {
      smoother.kill();
    };
  }, [isVideoReady]);

  // VIDEO CLIPPER
  // useVideoClipper({ isVideoReady, containerRef: videoContainerRef });

  const onPlayerReady = useCallback((event: YouTubeEvent) => {
    // Access to player in all event handlers via event.target
    event.target.playVideo();
    event.target.mute();
    setIsVideoReady(true);
  }, []);

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
      {/* BACKGROUND VIDEO - Outside smooth scroll wrapper */}
      <div
        ref={videoContainerRef}
        className="pointer-events-none fixed top-0 left-0 z-0 flex h-0 w-0 flex-col items-center justify-center overflow-clip bg-primary-100"
      >
        {/* Luminosity layer */}
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
            onReady={onPlayerReady}
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
              <div className="sidequest-title mb-4 h-fit overflow-clip">
                EPISODE AC 195
                <br />
                OPERATION METEOR
              </div>

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
                  <SwipeBlocks to="left" from="left">
                    <ScrambleText
                      continuous={true}
                      text="A time of conflict grips the Earth Sphere. The militaristic ALLIANCE maintains its iron grip over the space colonies through force and intimidation. In a desperate bid for freedom, five mysterious pilots have been dispatched to Earth, each commanding a powerful mobile suit known as a GUNDAM."
                    />
                  </SwipeBlocks>
                </motion.div>
                <motion.div
                  className="sidequest-text"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <SwipeBlocks delay={0.1} to="left" from="left">
                    <ScrambleText
                      continuous={true}
                      text="Their mission: to strike at the heart of the Alliance's power and free the colonies from tyranny. As these young warriors descend through Earth's atmosphere, none can predict how their arrival will forever alter the balance of power between Earth and the colonies...."
                    />
                  </SwipeBlocks>
                </motion.div>
              </motion.div>
            </div>
          </div>
          <div
            ref={sectionTwoRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Two</h2>
          </div>
          <div
            ref={sectionThreeRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Three</h2>
          </div>
          <div
            ref={sectionFourRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Four</h2>
          </div>
          <div
            ref={sectionFiveRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Five</h2>
          </div>
          <div
            ref={sectionSixRef}
            className="relative flex h-screen items-center justify-center"
          >
            <h2 className="z-50 text-6xl text-white">Section Six</h2>
          </div>
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
}
