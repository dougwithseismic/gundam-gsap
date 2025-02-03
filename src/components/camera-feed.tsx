import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VideoGrid from "../features/video-grid/video-grid";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { Marquee } from "./marquee";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface SectionFiveProps {
  sectionRef: React.RefObject<HTMLDivElement>;
  sectionTextRef: React.RefObject<HTMLDivElement>;
  gridData: {
    id: string;
    videoIndex: number;
    row: number;
    col: number;
  }[];
  seismicData: {
    title: string;
    description: string;
  }[];
}

const CameraFeed: React.FC<SectionFiveProps> = ({
  sectionRef,
  // sectionTextRef,
  gridData,
  seismicData,
}) => {
  const contextRef = useRef<gsap.Context | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    contextRef.current = gsap.context(() => {
      // Initial pulse animation with delay to match intro stagger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: overlayRef.current,
          start: "top center",
          once: true,
        },
      });

      gsap.set(overlayRef.current, {
        opacity: 0,
      });

      // Pulse effect
      tl.fromTo(
        overlayRef.current,
        { opacity: 1 },
        {
          opacity: 0.3,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: "expo.out",
        },
      )
        // Fade out and scale down
        .to(overlayRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: "power2.inOut",
          delay: 0.3,
        });
    });

    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, []);

  // Using callback ref pattern without trying to modify read-only ref
  const setRefs = (element: HTMLDivElement | null) => {
    overlayRef.current = element;
    // Just read from sectionTextRef if needed, but don't modify it
  };

  return (
    <div
      ref={sectionRef}
      className="relative flex items-center justify-center bg-black"
      data-speed="0.6"
    >
      {/* Text Overlay */}
      <div
        ref={setRefs}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white"
      >
        <div className="flex flex-col items-center gap-8">
          <SwipeBlocks delay={0.2}>
            <p className="mx-auto max-w-xs text-center font-mono text-sm sm:max-w-xl">
              ACCESSING OPTIMIZATION PROTOCOLS... LOADING FORCE MULTIPLIERS
            </p>
          </SwipeBlocks>
        </div>
      </div>
      {/* Video Grid Layout */}
      <div className="video-grid-wrapper h-full w-full">
        <Marquee direction="left" speed={20}>
          <span className="font-mono text-xs whitespace-nowrap text-white/30">
            SYSTEMS ONLINE • NEURAL INTERFACE ACTIVE • COMBAT DATA ANALYSIS •
            TACTICAL OVERLAY ENABLED • PERFORMANCE METRICS NOMINAL • SYSTEMS
            ONLINE • NEURAL INTERFACE ACTIVE • COMBAT DATA ANALYSIS • TACTICAL
            OVERLAY ENABLED • PERFORMANCE METRICS NOMINAL •
          </span>
        </Marquee>
        <VideoGrid gridData={gridData} seismicData={seismicData} />
        <Marquee direction="right" speed={20}>
          <span className="font-mono text-xs whitespace-nowrap text-white/30">
            REACTOR OUTPUT STABLE • MOBILITY SYSTEMS ENGAGED • WEAPONS CHECK
            COMPLETE • ALL SYSTEMS GREEN • MISSION START • REACTOR OUTPUT STABLE
            • MOBILITY SYSTEMS ENGAGED • WEAPONS CHECK COMPLETE • ALL SYSTEMS
            GREEN • MISSION START •
          </span>
        </Marquee>
      </div>
    </div>
  );
};

export { CameraFeed };
