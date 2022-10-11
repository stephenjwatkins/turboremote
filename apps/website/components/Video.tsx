import React, { useEffect, useRef } from "react";

const VIDEO_DELAY_AT_END = 8000;

export const Video = ({ src, ...restProps }: React.ComponentProps<"video">) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl) {
      return;
    }

    let timeout: NodeJS.Timeout;
    function handler() {
      timeout = setTimeout(() => {
        if (!videoEl) {
          return;
        }
        videoEl.play();
      }, VIDEO_DELAY_AT_END);
    }

    videoEl.addEventListener("ended", handler, false);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (!videoEl) {
        return;
      }
      videoEl.removeEventListener("ended", handler, false);
    };
  }, []);
  return (
    <video ref={videoRef} autoPlay muted playsInline {...restProps}>
      <source src={src} type="video/mp4" />
    </video>
  );
};
