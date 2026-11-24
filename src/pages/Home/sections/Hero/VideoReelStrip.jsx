import React, { useEffect, useRef, useState } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

const LOOP_REELS = [...REELS, ...REELS];

/**
 * Super-Fast Zero-Hang Continuous Sliding 5-Video Strip
 * - On normal/budget Android smartphones, mounting 10 <video> elements allocates 10 native
 *   MediaPlayer/SurfaceTexture layers and freezes the WebView.
 * - Solution: Only cards CURRENTLY visible inside the strip mount a <video> element (2-3 max on mobile),
 *   while offscreen cards stay lightweight 10KB WebP <img> posters (0 MediaPlayers!).
 * - When the customer scrolls down to the Order Form, ALL <video> elements unmount (0 decoders, 0 GPU load)
 *   so typing and tapping "অর্ডার কনফার্ম করুন" is 100% instant on any smartphone!
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);

  const [sectionVisible, setSectionVisible] = useState(true);
  const [activeIndices, setActiveIndices] = useState(() => new Set([0, 1, 2]));

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    // 1. Vertical observer: unmount all videos & pause animation when scrolled down to Order Form
    const sectionObs = new IntersectionObserver(
      (entries) => {
        const isVis = Boolean(entries[0]?.isIntersecting);
        setSectionVisible(isVis);
        if (track) {
          track.style.animationPlayState = isVis ? "running" : "paused";
        }
      },
      { threshold: 0.02 }
    );
    sectionObs.observe(section);

    // 2. Horizontal observer: mount <video> ONLY for the 2-3 cards actually visible on screen
    const cardObs = new IntersectionObserver(
      (entries) => {
        setActiveIndices((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const entry of entries) {
            const idx = Number(entry.target.getAttribute("data-reel-idx"));
            if (Number.isNaN(idx)) continue;
            if (entry.isIntersecting) {
              if (!next.has(idx)) {
                next.add(idx);
                changed = true;
              }
            } else {
              if (next.has(idx)) {
                next.delete(idx);
                changed = true;
              }
            }
          }
          return changed ? next : prev;
        });
      },
      {
        root: viewport,
        rootMargin: "0px 30px 0px 30px",
        threshold: 0.01,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) cardObs.observe(card);
    });

    return () => {
      sectionObs.disconnect();
      cardObs.disconnect();
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
            animation: glideFiveReelsAll 26s linear infinite;
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

      {/* Continuous Smooth Sliding 5-Video Strip (Only Visible Cards Mount <video> — Zero Hang!) */}
      <div ref={viewportRef} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div ref={trackRef} className="reels-five-track gap-2.5 sm:gap-3.5 py-0.5">
          {LOOP_REELS.map((reel, idx) => {
            const shouldMountVideo = sectionVisible && activeIndices.has(idx);
            return (
              <div
                key={`reel-loop-${idx}`}
                ref={(el) => { cardRefs.current[idx] = el; }}
                data-reel-idx={idx}
                className="flex-none w-[142px] sm:w-[172px] md:w-[195px] h-[195px] sm:h-[228px] md:h-[250px] rounded-2xl overflow-hidden bg-[#e8ede5] border border-[#4A6741]/20 shadow-sm relative"
              >
                <img
                  src={reel.poster}
                  alt={reel.label}
                  width={195}
                  height={250}
                  loading={idx < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover pointer-events-none"
                />
                {shouldMountVideo && (
                  <video
                    src={reel.src}
                    poster={reel.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    onCanPlay={(e) => {
                      const p = e.currentTarget.play();
                      if (p && typeof p.catch === "function") p.catch(() => {});
                    }}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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
