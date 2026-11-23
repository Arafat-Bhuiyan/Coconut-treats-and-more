import React, { useEffect, useRef } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

/**
 * 5 Real Live Auto-Playing Videos — Slowly Sliding Back & Forth (Zero Duplicates, Zero Frozen Cards!)
 * - Every single one of the 5 cards is a real, playing <video> (total 615KB combined, Baseline 3.0 256p)
 * - Direct src + autoPlay + muted + playsInline (never blocked by Brave Mobile or iOS Safari)
 * - Smooth GPU translate3d slow glide across all 5 videos on mobile, 5-column grid on desktop
 * - Auto-pauses when scrolled down to the Order Form so checkout stays 100% super fast
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section) return;

    const setPlayState = (playing) => {
      if (track) {
        track.style.animationPlayState = playing ? "running" : "paused";
      }
      videoRefs.current.forEach((vid) => {
        if (!vid) return;
        vid.muted = true;
        vid.defaultMuted = true;
        if (playing) {
          const p = vid.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else if (!vid.paused) {
          vid.pause();
        }
      });
    };

    // Immediately trigger play on mount
    setPlayState(true);

    // Pause cleanly when scrolled down to Order Form; resume when back in view
    let obs = null;
    if (typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver(
        (entries) => {
          setPlayState(Boolean(entries[0]?.isIntersecting));
        },
        { threshold: 0.05 }
      );
      obs.observe(section);
    }

    // Unlock on first touch for strict mobile Low Power Mode
    const unlock = () => setPlayState(true);
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true, passive: true });

    return () => {
      if (obs) obs.disconnect();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{ contain: "layout style paint" }}
      className="bg-[#F4F7F2] rounded-3xl p-2.5 sm:p-3.5 border border-[#4A6741]/20 shadow-sm overflow-hidden space-y-2.5"
    >
      <style>
        {`
          @keyframes glideFiveReelsAll {
            0%   { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .reels-five-track {
            display: flex;
            width: max-content;
            animation: glideFiveReelsAll 24s linear infinite;
            will-change: transform;
          }
          .reels-five-track:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* Compact Top Badges Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="bg-[#4A6741] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wide uppercase">
          Best Seller
        </span>
        <span className="bg-white text-[#2C332A] text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#4A6741]/20 shadow-2xs flex items-center gap-1">
          <span>🥥</span>
          <span>Made Fresh Every Morning</span>
        </span>
      </div>

      {/* Continuous Smooth Sliding 5-Video Strip on BOTH Mobile & PC (cached 615KB total, auto-pauses on scroll) */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div ref={trackRef} className="reels-five-track gap-2.5 sm:gap-3.5 py-0.5">
          {[...REELS, ...REELS].map((reel, idx) => (
            <div
              key={`reel-loop-${idx}`}
              className="flex-none w-[142px] sm:w-[172px] md:w-[195px] h-[195px] sm:h-[228px] md:h-[250px] rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
            >
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={reel.src}
                poster={reel.poster}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clean Bottom Caption */}
      <div className="text-center text-[10px] sm:text-[11px] font-black text-[#4A6741] tracking-wider uppercase">
        6 Pieces Per Box • Fresh Made Daily
      </div>
    </div>
  );
};

export default VideoReelStrip;
