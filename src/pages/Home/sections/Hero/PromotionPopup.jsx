import React, { useState, useEffect } from "react";
import { X, Sparkles, ShoppingBag, CheckCircle } from "lucide-react";
import CountdownTimer from "../../../../components/CountdownTimer";

const PromotionPopup = ({ isOpen, onClose, onClaim }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimated(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 ${!isAnimated ? 'pointer-events-none' : ''}`}>
      {/* Backdrop blur with fade-in */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#161a14]/80 backdrop-blur-md transition-opacity duration-300 ${
          isAnimated ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md bg-white rounded-[2.2rem] sm:rounded-[2.5rem] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_30px_70px_rgba(74,103,65,0.3)] border border-secondary/10 z-10 transition-all duration-300 transform ${
          isAnimated ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Top Glowing Accent Bar */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

        {/* Top Close Button - Bold & Easy to Tap */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-200 text-slate-700 hover:bg-red-100 hover:text-red-600 transition-all z-20 shadow-md border-2 border-slate-300 hover:border-red-300 cursor-pointer flex items-center justify-center"
          aria-label="Close promotion dialog"
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Top Branding Section (Upper Ticket Stub) */}
        <div className="px-5 pt-6 pb-2.5 text-center">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
            <Sparkles size={11} fill="currentColor" className="animate-pulse text-amber-500" />
            LIMITED TIME DEAL
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-husk leading-tight tracking-tight px-4">
            Super Saver Bulk Offer!
          </h3>
          <p className="text-[11px] text-husk/50 font-bold mt-0.5">Don't miss out on these premium savings</p>
        </div>

        {/* Horizontal Coupon Tear Line with cutouts */}
        <div className="relative my-2">
          <div className="border-t-2 border-dashed border-gray-200 mx-5" />
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#161a14] z-10 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.15)]" />
          <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#161a14] z-10 shadow-[inset_3px_0_5px_rgba(0,0,0,0.15)]" />
        </div>

        {/* Lower Content Area (Main Ticket Body) */}
        <div className="p-5 pt-1.5 space-y-3.5">
          {/* Product Badge Indicator */}
          <div className="flex items-center justify-center gap-2 bg-primary/5 border border-primary/10 py-1.5 px-3 rounded-xl max-w-[260px] mx-auto shadow-inner">
            <span className="text-base">🥥</span>
            <div className="text-left">
              <p className="text-[8px] text-husk/50 uppercase font-black tracking-wider leading-none">Premium Coconut Pudding</p>
              <p className="font-extrabold text-husk text-[10px] sm:text-xs">Homemade & 100% Fresh Daily</p>
            </div>
          </div>

          {/* Pricing Comparison Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Regular Price Card */}
            <div className="bg-slate-50/50 p-2.5 rounded-2xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
              <p className="text-[9px] text-husk/50 font-black uppercase tracking-wider mb-0.5">Regular Price</p>
              <p className="text-lg font-extrabold text-husk/60 line-through">৳750</p>
              <p className="text-[8px] text-husk/40 font-bold">per box</p>
            </div>

            {/* Offer Price Card */}
            <div className="bg-accent/15 p-2.5 rounded-2xl border-2 border-accent/60 text-center relative overflow-hidden shadow-sm flex flex-col justify-center">
              <div className="absolute top-0 right-0 bg-accent text-husk text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                DEAL
              </div>
              <p className="text-[9px] text-primary font-black uppercase tracking-wider mb-0.5">Bulk Offer</p>
              <p className="text-xl font-black text-primary">৳700</p>
              <p className="text-[8px] text-primary/75 font-black">per box</p>
            </div>
          </div>

          {/* Crimson Savings Highlight Banner */}
          <div className="rounded-2xl py-4 px-3 flex flex-col items-center justify-center gap-2 transform hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4A6741 0%, #5A7336 100%)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.38)', boxShadow: '0 8px 28px rgba(74, 103, 65, 0.35), inset 0 1px 0 rgba(255,255,255,0.5)'}}>
            <span className="absolute inset-0 rounded-2xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 55%)', pointerEvents: 'none'}} />
            <div className="flex items-center gap-1.5 relative z-10">
              <span className="text-xl animate-bounce">🎁</span>
              <span className="text-sm sm:text-base font-black uppercase tracking-wider leading-none text-white/95" style={{textShadow: '0 1px 2.5px rgba(0,0,0,0.45)'}}>Instant Discount</span>
            </div>
            <p className="font-black text-xl sm:text-2xl text-center text-white relative z-10" style={{textShadow: '0 2px 5px rgba(0,0,0,0.55)'}}>🎉 ২ টি বাক্স একসাথে কিনলেই ১০০ টাকা ছাড়!</p>
          </div>

          <style>{`
            @keyframes greenOrderBlink {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(74, 103, 65, 0.6), 0 8px 20px -4px rgba(74, 103, 65, 0.4);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 24px 8px rgba(52, 211, 153, 0.75), 0 12px 28px -3px rgba(74, 103, 65, 0.5);
                transform: scale(1.02);
              }
            }
            .popup-green-blink-btn {
              animation: greenOrderBlink 1.4s ease-in-out infinite;
            }
          `}</style>

          {/* Green Blinking Order Now Button in circled spot */}
          <div className="pt-1 space-y-2">
            <a
              href="#order"
              onClick={(e) => {
                if (onClaim) onClaim(e);
              }}
              style={{ touchAction: 'manipulation' }}
              className="popup-green-blink-btn w-full bg-primary hover:bg-primary-dark text-white font-black text-base sm:text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer select-none group relative overflow-hidden no-underline text-center"
            >
              <span className="pointer-events-none absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="pointer-events-none relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <ShoppingBag size={20} className="pointer-events-none animate-bounce" />
              <span className="pointer-events-none">অর্ডার করুন (Order Now)</span>
            </a>

            <div className="flex items-center justify-center gap-1.5 text-primary text-[11px] font-bold">
              <CheckCircle size={12} className="text-primary flex-shrink-0" />
              <span>Minimum 2 boxes order required for ৳100 discount</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-center w-full">
            <CountdownTimer />
          </div>

          {/* Close CTA */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full hover:bg-slate-50 text-husk/50 hover:text-husk font-bold text-xs py-1.5 rounded-lg transition-all cursor-pointer text-center"
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
