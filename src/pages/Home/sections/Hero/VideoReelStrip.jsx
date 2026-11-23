import React, { useEffect, useRef } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
];

const VideoReelStrip = () => {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isVisible = true;

    const playAllVisible = () => {
      videoRefs.current.forEach((vid) => {
        if (!vid) return;
        vid.muted = true;
        vid.defaultMuted = true;
        if (isVisible) {
          const p = vid.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          vid.pause();
        }
      });
    };

    // Defer video src attachment slightly so initial page paint (FCP/LCP) is 100% instant
    const loadTimer = setTimeout(() => {
      videoRefs.current.forEach((vid) => {
        if (!vid) return;
        const dataSrc = vid.getAttribute("data-src");
        if (dataSrc && !vid.getAttribute("src")) {
          vid.setAttribute("src", dataSrc);
          vid.load();
        }
      });
      playAllVisible();
    }, 250);

    // Smart Auto-Pause when scrolled down to the Order Form (0% lag on budget mobiles!)
    let observer = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = Boolean(entry && entry.isIntersecting);
          playAllVisible();
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    }

    // Unlock autoplay on first user touch/click for strict iOS Low Power Mode
    const unlock = () => {
      if (isVisible) playAllVisible();
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true, passive: true });

    return () => {
      clearTimeout(loadTimer);
      if (observer) observer.disconnect();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  const allCards = [...REELS, ...REELS];

  return (
    <div
      ref={containerRef}
      className="bg-[#F4F7F2] rounded-3xl p-2.5 sm:p-3.5 border border-[#4A6741]/20 shadow-sm overflow-hidden space-y-2.5"
    >
      <style>
        {`
          @keyframes scrollVideoReels {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }
          .video-reels-marquee {
            display: flex;
            width: max-content;
            animation: scrollVideoReels 24s linear infinite;
            will-change: transform;
          }
          .video-reels-marquee:hover {
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

      {/* Half-Height Continuous Horizontal Landscape Video Strip */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 w-5 sm:w-10 bg-gradient-to-r from-[#F4F7F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-5 sm:w-10 bg-gradient-to-l from-[#F4F7F2] to-transparent z-10 pointer-events-none" />

        <div className="video-reels-marquee gap-2.5 sm:gap-3.5 py-0.5">
          {allCards.map((reel, idx) => (
            <div
              key={`reel-card-${idx}`}
              className="flex-none w-[138px] sm:w-[175px] md:w-[205px] h-[195px] sm:h-[235px] md:h-[265px] rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
            >
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
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
