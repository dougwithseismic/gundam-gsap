import { createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { GundamTagline } from "../features/animations/ws/gundam-tagline";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { ScrambleText } from "../features/scramble-effect/scramble-text";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // VIDEO CLIPPER
  useLayoutEffect(() => {
    if (!isReady) return;

    const tl = gsap.timeline();
    gsap.set(containerRef.current, {
      y: "100%",
      width: "0%",
      height: "0%",
    });
    gsap.set("#side-video", {
      y: "100%",
      width: "0%",
      height: "0%",
      transformOrigin: "top right",
      stagger: 0.1,
    });
    tl.to(containerRef.current, {
      y: "0%",
      duration: 1.2,
      width: "95%",
      height: "30%",
      ease: "expo.inOut",
    })

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
        mixBlendMode: "inherit",
      })
      .to(
        containerRef.current,
        {
          duration: 1,
          width: "100%",
          height: "100%",
          ease: "expo.inOut",
          opacity: 1,
          mixBlendMode: "luminosity",
          transformOrigin: "center center",
        },
        "<",
      );
  }, [isReady]);

  return (
    <div className="right-8 bottom-8 flex h-full w-full items-end justify-end">
      {/* BACKGROUND */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 flex h-0 w-0 items-center justify-center overflow-clip bg-primary-100 opacity-50 mix-blend-luminosity"
      >
        <iframe
          onLoad={() => setIsReady(true)}
          className="pointer-events-none min-h-svh min-w-svw scale-[1.2]"
          src="https://www.youtube.com/embed/bHNzEsCokLc?autoplay=1&mute=1&controls=0&loop=1&playlist=bHNzEsCokLc&start=58"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="sidequest-text absolute bottom-8 left-8 z-10 flex max-w-lg flex-col gap-4">
        <div className="sidequest-title mb-4">
          EPISODE AC 195
          <br />
          OPERATION METEOR
        </div>
        <div className="sidequest-text">
          <ScrambleText
            continuous={true}
            text="A time of conflict grips the Earth Sphere. The militaristic ALLIANCE maintains its iron grip over the space colonies through force and intimidation. In a desperate bid for freedom, five mysterious pilots have been dispatched to Earth, each commanding a powerful mobile suit known as a GUNDAM."
          />
        </div>
        <div className="sidequest-text">
          <ScrambleText
            continuous={true}
            text="Their mission: to strike at the heart of the Alliance's power and free the colonies from tyranny. As these young warriors descend through Earth's atmosphere, none can predict how their arrival will forever alter the balance of power between Earth and the colonies...."
          />
        </div>
      </div>

      {/* CONTENT */}
      <div
        ref={cardRef}
        className="z-10 grid h-fit w-full max-w-xs grid-cols-12 bg-gradient-to-br from-[var(--color-primary-400)] to-primary-300 p-4 font-mono"
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
  );
}
