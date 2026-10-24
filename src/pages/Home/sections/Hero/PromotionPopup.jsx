import React, { useEffect } from "react";
import { X, Sparkles, ShoppingBag, CheckCircle } from "lucide-react";
import CountdownTimer from "../../../../components/CountdownTimer";

const PromotionPopup = ({ isOpen, onClose, onClaim }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaim = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (onClose) onClose();
    if (onClaim) onClaim();

    // Direct fail-safe scroll to order form details
    setTimeout(() => {
      const target = document.getElementById("order-form-details");
      if (target) {
        const navOffset = 90;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 animate-fade-in">
      {/* Backdrop blur with fade-in */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#161a14]/80 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-[395px] bg-white rounded-[2rem] sm:rounded-[2.2rem] max-h-[94vh] overflow-y-auto no-scrollbar shadow-[0_0_40px_rgba(245,158,11,0.35),0_30px_70px_rgba(0,0,0,0.5)] border-2 border-amber-400 z-10"
      >
        {/* Top Glowing Accent Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-2.5 w-full" />

        {/* Top Close Button - Bold & Easy to Tap */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600 transition-all z-20 shadow-sm border border-slate-300 hover:border-red-300 cursor-pointer flex items-center justify-center"
          aria-label="Close promotion dialog"
        >
          <X size={17} strokeWidth={3} />
        </button>

        {/* Top Branding Section (Upper Ticket Stub) */}
        <div className="px-5 pt-4 pb-2 text-center">
          <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs mb-1.5">
            <Sparkles size={11} fill="currentColor" className="animate-pulse text-amber-500" />
            LIMITED TIME DEAL
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-husk leading-tight tracking-tight px-2">
            Super Saver Bulk Offer!
          </h3>
          <p className="text-[11px] text-husk/60 font-bold mt-0.5">Don't miss out on these premium savings</p>
        </div>

        {/* Horizontal Coupon Tear Line with cutouts */}
        <div className="relative my-1.5">
          <div className="border-t-2 border-dashed border-gray-200 mx-5" />
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#161a14] z-10 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.15)]" />
          <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#161a14] z-10 shadow-[inset_3px_0_5px_rgba(0,0,0,0.15)]" />
        </div>

        {/* Lower Content Area (Main Ticket Body) */}
        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-2.5">
          {/* Product Badge Indicator */}
          <div className="flex items-center justify-center gap-2 bg-primary/5 border border-primary/15 py-1.5 px-3 rounded-xl max-w-[260px] mx-auto shadow-inner">
            <span className="text-base">🥥</span>
            <div className="text-left">
              <p className="text-[8px] text-husk/55 uppercase font-black tracking-wider leading-none">Premium Coconut Pudding</p>
              <p className="font-extrabold text-husk text-[10.5px] sm:text-xs">Homemade & 100% Fresh Daily</p>
            </div>
          </div>

          {/* Pricing Comparison Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Regular Price Card */}
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 text-center shadow-2xs flex flex-col justify-center">
              <p className="text-[9px] text-husk/55 font-black uppercase tracking-wider">Regular Price</p>
              <p className="text-base sm:text-lg font-extrabold text-husk/50 line-through leading-tight">৳750</p>
              <p className="text-[8px] text-husk/45 font-bold">per box</p>
            </div>

            {/* Offer Price Card */}
            <div className="bg-emerald-50/90 p-2 rounded-2xl border-2 border-[#4A6741] text-center relative overflow-hidden shadow-xs flex flex-col justify-center">
              <div className="absolute top-0 right-0 bg-[#4A6741] text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                DEAL
              </div>
              <p className="text-[9px] text-[#4A6741] font-black uppercase tracking-wider">Bulk Offer</p>
              <p className="text-lg sm:text-xl font-black text-[#4A6741] leading-tight">৳700</p>
              <p className="text-[8px] text-[#4A6741]/80 font-black">per box</p>
            </div>
          </div>

          <style>{`
            @keyframes discountCardPulse {
              0%, 100% {
                box-shadow: 0 0 18px 4px rgba(245, 158, 11, 0.75), 0 0 32px 8px rgba(251, 191, 36, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.65);
                border-color: #fbbf24;
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 26px 8px rgba(245, 158, 11, 0.95), 0 0 45px 14px rgba(251, 191, 36, 0.65), inset 0 1px 3px rgba(255, 255, 255, 0.85);
                border-color: #fde047;
                transform: scale(1.015);
              }
            }
            @keyframes shimmerSweep {
              0% { transform: translateX(-120%) skewX(-15deg); }
              100% { transform: translateX(220%) skewX(-15deg); }
            }
            @keyframes greenOrderBlink {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(74, 103, 65, 0.6), 0 6px 18px -3px rgba(74, 103, 65, 0.4);
              }
              50% {
                box-shadow: 0 0 18px 5px rgba(52, 211, 153, 0.65), 0 10px 24px -2px rgba(74, 103, 65, 0.5);
              }
            }
            .popup-discount-highlight {
              animation: discountCardPulse 1.8s ease-in-out infinite;
            }
            .popup-shimmer-bar {
              animation: shimmerSweep 2.6s infinite;
            }
            .popup-green-blink-btn {
              animation: greenOrderBlink 1.5s ease-in-out infinite;
            }
          `}</style>

          {/* Eye-Catching Bold 24K Golden Instant Discount Banner with Strong Golden Glow Border */}
          <div
            onClick={handleClaim}
            className="popup-discount-highlight rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer select-none border-[3px] border-amber-300"
            style={{
              background: 'linear-gradient(135deg, #92400E 0%, #B45309 25%, #D97706 60%, #B45309 100%)',
            }}
          >
            {/* Animated Shimmer Light Sweep */}
            <span
              className="popup-shimmer-bar pointer-events-none absolute inset-0 w-1/2 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 251, 235, 0.42), transparent)',
              }}
            />

            {/* Top Golden Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-amber-300 text-amber-950 px-3 py-0.5 rounded-full shadow-sm relative z-10 border border-white/80">
              <span className="text-sm leading-none animate-bounce">🎁</span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-none">
                INSTANT DISCOUNT
              </span>
            </div>

            {/* Main Bengali Offer Text */}
            <p
              className="font-black text-base sm:text-lg text-center text-white relative z-10 leading-snug mt-0.5"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.45)' }}
            >
              🎉 ২ টি বক্স একসাথে কিনলেই
            </p>

            {/* Ultra-Visible 100 Taka Off Callout Badge */}
            <div className="bg-white text-amber-950 font-black text-lg sm:text-xl px-4 py-1 rounded-xl shadow-md border-2 border-amber-300 relative z-10 flex items-center gap-1.5 tracking-tight">
              <span>🔥</span>
              <span>নগদ ১০০ টাকা ছাড়!</span>
            </div>
          </div>

          {/* Green Blinking Order Now Button */}
          <div className="pt-0.5 space-y-1.5">
            <button
              type="button"
              onClick={handleClaim}
              style={{ touchAction: 'manipulation' }}
              className="popup-green-blink-btn w-full bg-gradient-to-r from-[#4A6741] via-[#3B5932] to-[#2F4827] hover:brightness-110 active:scale-[0.99] text-white font-black text-base sm:text-lg py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer select-none group relative overflow-hidden text-center border-0 outline-none"
            >
              <span className="pointer-events-none absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="pointer-events-none relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <ShoppingBag size={19} className="pointer-events-none animate-bounce" />
              <span className="pointer-events-none">Quick Order (কুইক অর্ডার)</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-primary text-[10.5px] font-bold">
              <CheckCircle size={12} className="text-primary flex-shrink-0" />
              <span>Minimum 2 boxes order required for ৳100 discount</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="pt-1.5 border-t border-dashed border-gray-200 flex items-center justify-center w-full">
            <CountdownTimer />
          </div>

          {/* Close CTA */}
          <div>
            <button
              type="button"
              onClick={onClose}
              className="w-full hover:bg-slate-50 text-husk/50 hover:text-husk font-bold text-[11px] py-1 rounded-lg transition-all cursor-pointer text-center"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionPopup;
