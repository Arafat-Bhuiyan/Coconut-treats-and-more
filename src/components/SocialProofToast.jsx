import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Check, Clock } from "lucide-react";
import { BANGLADESH_CUSTOMERS, ORDER_VARIATIONS, RELATIVE_TIMES } from "../data/socialProofData";

const SocialProofToast = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isHoveredRef = useRef(false);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const showNextNotification = useCallback(() => {
    if (isDismissed) return;

    const customer = getRandomItem(BANGLADESH_CUSTOMERS);
    const variation = getRandomItem(ORDER_VARIATIONS);
    const time = getRandomItem(RELATIVE_TIMES);

    setCurrentOrder({
      name: customer.name,
      area: customer.area,
      label: variation.label,
      note: variation.note,
      time: time
    });

    setIsVisible(true);

    // Stay visible for 5.5 seconds, then gracefully hide
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsVisible(false);
      }
    }, 5500);
  }, [isDismissed]);

  useEffect(() => {
    // 1. Initial appearance after 4 seconds
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 4000);

    // 2. Loop interval: trigger every 15-20 seconds
    const scheduleNext = () => {
      const nextDelay = Math.floor(Math.random() * 5000) + 15000; // 15-20s
      timerRef.current = setTimeout(() => {
        showNextNotification();
        scheduleNext();
      }, nextDelay);
    };

    scheduleNext();

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showNextNotification]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    // Pause for 1 minute when user explicitly dismisses
    setIsDismissed(true);
    setTimeout(() => {
      setIsDismissed(false);
    }, 60000);
  };

  const handleClickToast = () => {
    const orderSection = document.getElementById("order");
    if (orderSection) {
      const navOffset = 70;
      const targetY = orderSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    }
  };

  if (!currentOrder) return null;

  return (
    <div
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        // If left and was visible, hide after 2.5s
        if (isVisible) {
          hideTimerRef.current = setTimeout(() => setIsVisible(false), 2500);
        }
      }}
      onClick={handleClickToast}
      style={{ touchAction: "manipulation" }}
      className={`fixed z-40 transition-all duration-500 ease-out transform cursor-pointer select-none
        /* Mobile Position: Above WhatsApp button */
        bottom-32 left-3 right-3 sm:right-auto sm:max-w-[360px]
        /* Desktop Position: Stacked smoothly above WhatsApp */
        sm:bottom-28 sm:left-6
        ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        }
      `}
      role="status"
      aria-live="polite"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl p-3 sm:p-3.5 shadow-[0_16px_40px_-10px_rgba(31,41,30,0.18)] flex items-center gap-3 relative overflow-hidden group hover:scale-[1.02] hover:shadow-[0_20px_45px_-8px_rgba(31,41,30,0.22)] transition-all duration-300">
        
        {/* Left Product Thumbnail with Live Pulse */}
        <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-50 border border-gray-100 shadow-inner">
          <picture>
            <source srcSet="/pudding-3d.webp" type="image/webp" />
            <img
              src="/pudding-3d.jpg"
              alt="Fresh Coconut Pudding"
              className="w-full h-full object-cover"
              loading="lazy"
              width={56}
              height={56}
            />
          </picture>
          
          {/* Pulsing Live Dot */}
          <span className="absolute top-1 left-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0 pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-[#1F291E] tracking-tight">
              {currentOrder.name}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold border border-emerald-200/50">
              <Check size={10} strokeWidth={3} />
              ভেরিফাইড
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-500 font-semibold truncate mt-0.2">
            📍 {currentOrder.area}
          </p>

          <p className="text-xs sm:text-[13px] text-gray-800 font-bold leading-tight mt-0.5">
            এইমাত্র <span className="text-[#4A6741] font-black">{currentOrder.label}</span> অর্ডার করেছেন!
          </p>

          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Clock size={11} />
              {currentOrder.time}
            </span>
            <span>•</span>
            <span className="text-gray-500">🚚 ডেলিভারি শিডিউলড</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-600 active:text-gray-800 p-1 rounded-full text-xs font-bold transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X size={13} />
        </button>

      </div>
    </div>
  );
};

export default SocialProofToast;
