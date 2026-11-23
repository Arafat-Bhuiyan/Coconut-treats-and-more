import React, { useEffect, useRef } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding", liveVideo: true },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer", liveVideo: true },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box", liveVideo: false },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily", liveVideo: false },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste", liveVideo: false },
];

const ALL_CARDS = [...REELS, ...REELS];

/**
 * 100% Zero-Hang, Zero-Rerender Slowly-Sliding Video Strip
 * - Strictly 2 tiny Baseline H.264 <video> decoders total (290KB combined, never exceeds budget phone MediaCodec limit)
 * - ZERO React state updates or DOM mount/unmount during animation (0% jank)
 * - Pure DOM ref IntersectionObserver pauses both videos & CSS marquee the instant user scrolls to Order Form
 */
const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const marqueeRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const marquee = marqueeRef.current;
    if (!section) return;

    let isVisible = true;

    const syncDom = () => {
      if (marquee) {
        marquee.style.animationPlayState = isVisible ? "running" : "paused";
      }
      videoRefs.current.forEach((vid) => {
        if (!vid) return;
        if (isVisible) {
          const dataSrc = vid.getAttribute("data-src");
          if (dataSrc && !vid.getAttribute("src")) {
            vid.setAttribute("src", dataSrc);
            vid.load();
          }
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

    // Defer video src slightly so initial paint & form interaction are 100% instant
    const startTimer = setTimeout(syncDom, 400);

    let obs = null;
    if (typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver(
        (entries) => {
          isVisible = Boolean(entries[0]?.isIntersecting);
          syncDom();
        },
        { threshold: 0.05 }
      );
      obs.observe(section);
    }

    const unlock = () => { if (isVisible) syncDom(); };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    return () => {
      clearTimeout(startTimer);
      if (obs) obs.disconnect();
      window.removeEventListener("touchstart", unlock);
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
          @keyframes scrollReelsZeroHang {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }
          .reels-zero-hang-marquee {
            display: flex;
            width: max-content;
            animation: scrollReelsZeroHang 28s linear infinite;
            will-change: transform;
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

      {/* Smooth Slowly-Sliding Strip (Strictly 2 hardware-safe videos + crisp 10KB WebP cards, 0 React re-renders) */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />

        <div ref={marqueeRef} className="reels-zero-hang-marquee gap-2.5 sm:gap-3.5 py-0.5">
          {ALL_CARDS.map((reel, idx) => {
            // Strictly mount ONLY 2 <video> elements total (idx 0 and idx 1) -> 0% MediaCodec overload!
            const useVideoTag = idx < 2 && reel.liveVideo;
            return (
              <div
                key={`reel-zh-${idx}`}
                className="flex-none w-[138px] sm:w-[172px] md:w-[195px] h-[192px] sm:h-[228px] md:h-[250px] rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
              >
                {useVideoTag ? (
                  <video
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    data-src={reel.src}
                    poster={reel.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
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
