import React, { useEffect, useRef } from "react";

const REELS = [
  { src: "/videos/reel-1.mp4", poster: "/videos/reel-1.webp", label: "Fresh Coconut Pudding" },
  { src: "/videos/reel-2.mp4", poster: "/videos/reel-2.webp", label: "Pure Cow Milk Layer" },
  { src: "/videos/reel-3.mp4", poster: "/videos/reel-3.webp", label: "6 Cups Per Box" },
  { src: "/videos/reel-4.mp4", poster: "/videos/reel-4.webp", label: "Made Fresh Daily" },
  { src: "/videos/reel-5.mp4", poster: "/videos/reel-5.webp", label: "Creamy Homemade Taste" },
];

const VideoReelStrip = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const videoRefs = useRef([]);
  const isSectionVisibleRef = useRef(true);
  const isUserInteractingRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const visibleSet = new Set();

    const syncPlayback = () => {
      videoRefs.current.forEach((vid, idx) => {
        if (!vid) return;
        const shouldPlay = isSectionVisibleRef.current && visibleSet.has(idx);
        if (shouldPlay) {
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

    // 1. Whole-strip visibility observer (pauses ALL videos instantly when user scrolls down to Order Form)
    let sectionObserver = null;
    if (typeof IntersectionObserver !== "undefined") {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          isSectionVisibleRef.current = Boolean(entries[0]?.isIntersecting);
          syncPlayback();
        },
        { threshold: 0.05 }
      );
      sectionObserver.observe(section);
    }

    // 2. Per-card horizontal visibility observer (only plays 2-3 currently visible videos -> 0% hang on low-end phones!)
    let cardObserver = null;
    const initTimer = setTimeout(() => {
      if (typeof IntersectionObserver !== "undefined") {
        cardObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const idx = Number(entry.target.getAttribute("data-idx"));
              if (entry.isIntersecting) visibleSet.add(idx);
              else visibleSet.delete(idx);
            });
            syncPlayback();
          },
          { root: track, threshold: 0.35 }
        );
        videoRefs.current.forEach((vid) => {
          if (vid) cardObserver.observe(vid);
        });
      } else {
        REELS.forEach((_, i) => visibleSet.add(i));
        syncPlayback();
      }
    }, 300);

    // 3. Gentle auto-slide on mobile (pauses immediately when user touches/swipes or scrolls to form)
    let direction = 1;
    const autoScrollInterval = setInterval(() => {
      if (!isSectionVisibleRef.current || isUserInteractingRef.current) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 10) return; // PC shows all 5 side-by-side cleanly without needing scroll
      if (track.scrollLeft >= maxScroll - 4) direction = -1;
      else if (track.scrollLeft <= 4) direction = 1;
      track.scrollBy({ left: direction * 150, behavior: "smooth" });
    }, 3200);

    const onTouchStart = () => { isUserInteractingRef.current = true; };
    const onTouchEnd = () => {
      setTimeout(() => { isUserInteractingRef.current = false; }, 4000);
    };
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });

    const unlock = () => syncPlayback();
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true, passive: true });

    return () => {
      clearTimeout(initTimer);
      clearInterval(autoScrollInterval);
      if (sectionObserver) sectionObserver.disconnect();
      if (cardObserver) cardObserver.disconnect();
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

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

      {/* Zero-Lag Horizontal Landscape 5-Video Strip (Only 5 light Baseline MP4s, max 2-3 active on mobile) */}
      <div
        ref={trackRef}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-1 px-0.5 no-scrollbar md:grid md:grid-cols-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {REELS.map((reel, idx) => (
          <div
            key={reel.src}
            className="flex-none w-[142px] sm:w-[170px] md:w-full h-[195px] sm:h-[225px] md:h-[245px] snap-start rounded-2xl overflow-hidden bg-black/5 border border-[#4A6741]/20 shadow-sm relative"
          >
            <video
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              data-idx={idx}
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

      {/* Clean Bottom Caption */}
      <div className="text-center text-[10px] sm:text-[11px] font-black text-[#4A6741] tracking-wider uppercase">
        6 Pieces Per Box • Fresh Made Daily
      </div>
    </div>
  );
};

export default VideoReelStrip;
