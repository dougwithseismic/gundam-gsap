import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        element: HTMLElement | null,
        config: {
          videoId: string;
          playerVars: {
            autoplay: number;
            mute: number;
            controls: number;
            loop: number;
            playlist: string;
          };
          events: {
            onReady: (event: { target: any }) => void;
            onStateChange: (event: { data: number }) => void;
          };
        },
      ) => void;
    };
  }
}

const YouTubePlayer = ({ videoId }: { videoId: string }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    // Load the YouTube IFrame Player API code asynchronously
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    // Create the player once the API is ready
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: videoId, // Set playlist to videoId for looping
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackQuality("hd1080");
            // Center the video
            event.target.setPlaybackRate(1);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              event.target.setPlaybackQuality("hd1080");
            }
          },
        },
      });
    };

    // Cleanup
    return () => {
      // @ts-expect-error Intentionally clearing global callback
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId]); // Added videoId to dependencies

  return (
    <div className="h-full w-full">
      <div
        ref={playerRef}
        className="pointer-events-none min-h-screen min-w-screen"
      />
    </div>
  );
};

export default YouTubePlayer;
