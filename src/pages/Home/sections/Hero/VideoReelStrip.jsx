import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

/**
 * Ultra-Lightweight Zero-Hang 5-Video Landscape Strip
 * - Strictly mounts ONLY ONE (1) active <video> decoder at any time (never chokes budget phones or FB In-App Browser)
 * - Other 4 cards display instant 10KB WebP thumbnails with tap-to-play
 * - Automatically unmounts/pauses even the 1 video the instant the user scrolls down to the Order Form
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [readyToPlay, setReadyToPlay] = useState(false);

  useEffect(() => {
    // Wait 350ms after initial paint so FCP/LCP and touch responsiveness are 100% instant
    const t = setTimeout(() => setReadyToPlay(true), 350);

    const el = sectionRef.current;
    let observer = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          setIsVisible(Boolean(entries[0]?.isIntersecting));
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
    }

    return () => {
      clearTimeout(t);
      if (observer) observer.disconnect();
    };
  }, []);

  const handleVideoEnded = () => {
    setActiveIdx((prev) => (prev + 1) % REELS.length);
  };

  return (
    <div
      ref={sectionRef}
      className="bg-[#F4F7F2] rounded-3xl p-2.5 sm:p-3.5 border border-[#4A6741]/20 shadow-sm overflow-hidden space-y-2.5"
    >
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

      {/* Zero-Hang Horizontal 5-Video Landscape Strip (Strictly 1 active decoder at a time!) */}
      <div
        className="flex gap-2.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-1 px-0.5 md:grid md:grid-cols-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {REELS.map((reel, idx) => {
          const isPlayingThis = readyToPlay && isVisible && activeIdx === idx;
          return (
            <button
              key={reel.src}
              type="button"
              onClick={() => setActiveIdx(idx)}
              style={{ touchAction: "manipulation" }}
              className={`flex-none w-[142px] sm:w-[170px] md:w-full h-[195px] sm:h-[225px] md:h-[245px] snap-start rounded-2xl overflow-hidden bg-black/5 relative cursor-pointer select-none transition-all ${
                activeIdx === idx
                  ? "ring-2 ring-[#4A6741] shadow-md"
                  : "border border-[#4A6741]/20 shadow-xs"
              }`}
              aria-label={`Play ${reel.label}`}
            >
              {isPlayingThis ? (
                <video
                  key={reel.src}
                  src={reel.src}
                  poster={reel.poster}
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <>
                  <img
                    src={reel.poster}
                    alt={reel.label}
                    width={170}
                    height={225}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="w-9 h-9 rounded-full bg-white/90 text-[#2B4C23] flex items-center justify-center shadow-md">
                      <Play size={16} className="ml-0.5 fill-current" />
                    </span>
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Clean Bottom Caption */}
      <div className="text-center text-[10px] sm:text-[11px] font-black text-[#4A6741] tracking-wider uppercase">
        6 Pieces Per Box • Fresh Made Daily
      </div>
    </div>
  );
};

export default VideoReelStrip;
