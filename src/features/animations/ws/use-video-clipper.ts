import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface VideoClipperOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  titleSelector?: string;
  isVideoReady?: boolean;
}

export const useVideoClipper = ({
  isVideoReady = false,
  containerRef,
  titleSelector = ".sidequest-title",
}: VideoClipperOptions) => {
  const splitTextRef = useRef<SplitText | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      paused: !isVideoReady,
    });

    splitTextRef.current = new SplitText(titleSelector, {
      types: "lines",
    });

    // SET INITIALS
    gsap.set(containerRef.current, {
      yPercent: "100%",
      width: "0%",
      height: "0%",
    });

    gsap.set(splitTextRef.current.lines, {
      opacity: 0,
      yPercent: 100,
    });

    gsap.set("#side-video", {
      yPercent: "100%",
      width: "0%",
      height: "0%",
      transformOrigin: "top right",
      stagger: 0.1,
    });

    // ANIMATE
    tl.to(containerRef.current, {
      yPercent: "0%",
      duration: 1.2,
      width: "95%",
      height: "30%",
      ease: "expo.inOut",
    })
      // ANIMATE TEXT TITLES IN
      .to(
        splitTextRef.current.lines,
        {
          opacity: 1,
          stagger: 0.1,
          yPercent: 0,
        },
        "<",
      )
      .to(
        containerRef.current,
        {
          duration: 1,
          width: "40%",
          height: "90%",
          ease: "expo.inOut",
        },
        "<60%",
      )
      .to(containerRef.current, {
        duration: 1,
        width: "100%",
        height: "100%",
        ease: "expo.inOut",
        opacity: 1,
      })
      .to(
        containerRef.current,
        {
          duration: 1,
          width: "100%",
          height: "100%",
          ease: "expo.inOut",
          opacity: 1,
          transformOrigin: "center center",
        },
        "<",
      );

    // Add scroll trigger animation
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100",
        scrub: true,
      },
      width: "80%",
      height: "80%",
      ease: "none",
    });

    return () => {
      tl.kill();
      splitTextRef.current?.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [containerRef, titleSelector, isVideoReady]);
};
