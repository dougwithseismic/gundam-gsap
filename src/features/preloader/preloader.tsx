import { motion } from "framer-motion";
import { SwipeBlocks } from "../animations/ws/swipe-blocks";
import { ScrambleText } from "../scramble-effect/scramble-text";

interface PreloaderProps {
  isReady: boolean;
}

export const Preloader = ({ isReady }: PreloaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isReady ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "expo.inOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{
        pointerEvents: isReady ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-8">
        <SwipeBlocks>
          <ScrambleText
            text="WS™"
            className="font-mono text-4xl font-bold text-white sm:text-6xl md:text-8xl"
            continuous={true}
            scrambleOptions={{
              maxScrambleCount: 3,
              scrambleChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ™",
            }}
          />
        </SwipeBlocks>
        <motion.div
          className="font-mono text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
          >
            loading...
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};
