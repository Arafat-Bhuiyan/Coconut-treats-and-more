import React, { useEffect, useRef, useState } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

const ALL_CARDS = [...REELS, ...REELS];

/**
 * Ultra-Lightweight Slowly-Sliding Auto-Playing 5-Video Strip
 * - All 5 videos compressed to 95–159KB each (615KB total, H.264 Baseline 3.0)
 * - Smooth GPU-only CSS translate3d slow glide (1,500px total width < 4096px GPU tile limit)
 * - Per-card IntersectionObserver strictly mounts/plays ONLY the 2–3 cards currently in viewport
 * - Entire strip + all videos auto-pause the instant user scrolls down to the Order Form (0% hang!)
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const cardRefs = useRef([]);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [visibleCards, setVisibleCards] = useState(() => new Set([0, 1, 2]));

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);

    const section = sectionRef.current;
    const viewport = viewportRef.current;

    let sectionObs = null;
    if (section && typeof IntersectionObserver !== "undefined") {
      sectionObs = new IntersectionObserver(
        (entries) => {
          setSectionVisible(Boolean(entries[0]?.isIntersecting));
        },
        { threshold: 0.05 }
      );
      sectionObs.observe(section);
    }

    let cardObs = null;
    if (viewport && typeof IntersectionObserver !== "undefined") {
      cardObs = new IntersectionObserver(
        (entries) => {
          setVisibleCards((prev) => {
            const next = new Set(prev);
            let changed = false;
            entries.forEach((entry) => {
              const idx = Number(entry.target.getAttribute("data-card-idx"));
              if (entry.isIntersecting) {
                if (!next.has(idx)) { next.add(idx); changed = true; }
              } else {
                if (next.has(idx)) { next.delete(idx); changed = true; }
              }
            });
            return changed ? next : prev;
          });
        },
        { root: viewport, rootMargin: "0px 40px 0px 40px", threshold: 0.01 }
      );

      cardRefs.current.forEach((el) => {
        if (el) cardObs.observe(el);
      });
    }

    return () => {
      clearTimeout(t);
      if (sectionObs) sectionObs.disconnect();
      if (cardObs) cardObs.disconnect();
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
          @keyframes scrollReelsSlow {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }
          .reels-slow-marquee {
            display: flex;
            width: max-content;
            animation: scrollReelsSlow 28s linear infinite;
            will-change: transform;
          }
          .reels-slow-marquee:hover {
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

      {/* Smooth Slowly-Sliding Landscape Strip (Only visible 2–3 videos mounted at a time -> 0% hang!) */}
      <div ref={viewportRef} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />

        <div
          className="reels-slow-marquee gap-2.5 sm:gap-3.5 py-0.5"
          style={{ animationPlayState: sectionVisible ? "running" : "paused" }}
        >
          {ALL_CARDS.map((reel, idx) => {
            const shouldMountVideo = ready && sectionVisible && visibleCards.has(idx);
            return (
              <div
                key={`reel-slide-${idx}`}
                ref={(el) => { cardRefs.current[idx] = el; }}
                data-card-idx={idx}
                className="flex-none w-[138px] sm:w-[172px] md:w-[195px] h-[192px] sm:h-[228px] md:h-[250px] rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
              >
                {shouldMountVideo ? (
                  <video
                    src={reel.src}
                    poster={reel.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <img
                    src={reel.poster}
                    alt={reel.label}
                    width={195}
                    height={250}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                )}
              </div>
            );
          })}
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
