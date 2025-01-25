import { createFileRoute } from "@tanstack/react-router";
import { useRef, useCallback, useState } from "react";
import { GundamTagline } from "../features/animations/ws/gundam-tagline";
import { SwipeBlocks } from "../features/animations/ws/swipe-blocks";
import { ScrambleText } from "../features/scramble-effect/scramble-text";
import { motion } from "framer-motion";
import { useVideoClipper } from "../features/animations/ws/use-video-clipper";
import YouTube, { YouTubeEvent } from "react-youtube";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // VIDEO CLIPPER
  useVideoClipper({ isVideoReady, containerRef });

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
      playlist: "bHNzEsCokLc",
      start: 58,
    },
  };

  return (
    <div className="right-8 bottom-8 flex h-full w-full items-end justify-end">
      {/* BACKGROUND */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 flex h-0 w-0 items-center justify-center overflow-clip bg-primary-100 opacity-50 mix-blend-luminosity"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="pointer-events-none min-h-svh min-w-svw scale-[1.2]"
        >
          <YouTube
            videoId="bHNzEsCokLc"
            opts={opts}
            onReady={onPlayerReady}
            className="pointer-events-none"
            iframeClassName="pointer-events-none min-h-svh min-w-svw scale-[1.2]"
          />
        </motion.div>
      </div>

      <div className="sidequest-text absolute bottom-8 left-8 z-10 flex max-w-lg flex-col gap-4">
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

      {/* CONTENT */}
      <div className="relative z-10 h-fit w-full max-w-xs">
        <div className="absolute inset-0 bg-primary-400 opacity-20 mix-blend-darken"></div>
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
    </div>
  );
}
