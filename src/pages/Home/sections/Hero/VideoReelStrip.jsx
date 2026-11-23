import React, { useEffect, useRef } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

/**
 * Ultra-Fast Continuous Sliding 5-Video Strip (Zero-Hang Mobile Hardware Decoder Safe!)
 * - All 5 videos slide smoothly & infinitely on both Mobile & PC
 * - Smart horizontal + vertical IntersectionObserver ensures ONLY the 2-3 videos
 *   actually visible on screen decode at any moment (never exhausts Android/iOS MediaCodec pool!)
 * - Auto-pauses ALL videos + animation immediately when customer scrolls down to Order Form
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const videoRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section) return;

    let isSectionVisible = true;
    const visibleCards = new Set([0, 1, 2]);

    const syncPlayback = () => {
      if (track) {
        track.style.animationPlayState = isSectionVisible ? "running" : "paused";
      }
      videoRefs.current.forEach((vid, idx) => {
        if (!vid) return;
        const shouldPlay = isSectionVisible && visibleCards.has(idx);
        if (shouldPlay) {
          vid.muted = true;
          vid.defaultMuted = true;
          if (vid.paused) {
            const p = vid.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }
        } else if (!vid.paused) {
          vid.pause();
        }
      });
    };

    // Initial playback for the first visible cards only
    syncPlayback();

    let sectionObs = null;
    let cardObs = null;

    if (typeof IntersectionObserver !== "undefined") {
      // 1. Vertical observer: pause everything when user scrolls down to the Order Form
      sectionObs = new IntersectionObserver(
        (entries) => {
          isSectionVisible = Boolean(entries[0]?.isIntersecting);
          syncPlayback();
        },
        { threshold: 0.05 }
      );
      sectionObs.observe(section);

      // 2. Horizontal observer: ONLY decode the 2-3 cards currently inside the visible strip window
      cardObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const idx = Number(entry.target.getAttribute("data-reel-idx"));
            if (Number.isNaN(idx)) return;
            if (entry.isIntersecting) {
              visibleCards.add(idx);
            } else {
              visibleCards.delete(idx);
            }
          });
          syncPlayback();
        },
        {
          root: viewport,
          rootMargin: "0px 60px 0px 60px",
          threshold: 0.01,
        }
      );

      cardRefs.current.forEach((card) => {
        if (card) cardObs.observe(card);
      });
    }

    // Unlock autoplay on first user interaction for strict mobile Low Power Mode
    const unlock = () => syncPlayback();
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true, passive: true });

    return () => {
      if (sectionObs) sectionObs.disconnect();
      if (cardObs) cardObs.disconnect();
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

      {/* Continuous Smooth Sliding 5-Video Strip (Viewport-Aware Decoder Pool — Zero Mobile Hang) */}
      <div ref={viewportRef} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div ref={trackRef} className="reels-five-track gap-2.5 sm:gap-3.5 py-0.5">
          {[...REELS, ...REELS].map((reel, idx) => (
            <div
              key={`reel-loop-${idx}`}
              ref={(el) => { cardRefs.current[idx] = el; }}
              data-reel-idx={idx}
              className="flex-none w-[142px] sm:w-[172px] md:w-[195px] h-[195px] sm:h-[228px] md:h-[250px] rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
            >
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={reel.src}
                poster={reel.poster}
                loop
                muted
                playsInline
                preload={idx < 3 ? "auto" : "metadata"}
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
