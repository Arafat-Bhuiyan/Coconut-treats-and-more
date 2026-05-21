import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShoppingBag, CheckCircle } from "lucide-react";

const PromotionPopup = ({ isOpen, onClose, onClaim }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop blur with Framer Motion fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#161a14]/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-[#FAF9F5] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-2 border-primary/20 z-10 no-scrollbar"
          >
            {/* Top Close Button - Highly Prominent & Fixed on Modal */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all z-20 shadow-lg border border-slate-200/50 cursor-pointer flex items-center justify-center"
              aria-label="Close promotion dialog"
            >
              <X size={16} />
            </button>

            {/* Top Branding Banner */}
            <div className="bg-gradient-to-r from-primary to-secondary py-4 px-6 sm:py-6 sm:px-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 pr-6">
                <span className="bg-accent/30 border border-accent/40 text-accent font-black text-[9px] sm:text-xs px-3.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-inner mb-1.5">
                  <Sparkles size={10} fill="currentColor" /> LIMITED TIME DEAL
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight">
                  Super Saver Bulk Offer!
                </h3>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 text-center relative z-10">
              {/* Product illustration badge */}
              <div className="flex items-center justify-center gap-2.5 mb-3 bg-primary/5 border border-primary/10 py-1.5 px-4 rounded-xl max-w-[280px] sm:max-w-sm mx-auto shadow-inner">
                <span className="text-xl sm:text-2xl animate-bounce duration-1000">🥥</span>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[10px] text-husk/50 uppercase font-black tracking-wider">Premium Pudding</p>
                  <p className="font-extrabold text-husk text-xs sm:text-sm">Homemade & 100% Fresh</p>
                </div>
              </div>

              {/* Clean Pricing Comparison Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mb-3">
                {/* Regular Price */}
                <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/60 text-center shadow-sm">
                  <p className="text-[9px] sm:text-xs text-husk/50 font-bold uppercase tracking-wider mb-0.5">Regular Price</p>
                  <p className="text-base sm:text-xl font-extrabold text-husk/70 line-through">৳600</p>
                  <p className="text-[8px] sm:text-[10px] text-husk/45 font-medium">per box</p>
                </div>

                {/* Offer Price */}
                <div className="bg-accent/15 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-accent/60 text-center relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-accent text-husk text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Offer
                  </div>
                  <p className="text-[9px] sm:text-xs text-primary font-bold uppercase tracking-wider mb-0.5">Bulk Offer</p>
                  <p className="text-lg sm:text-2xl font-black text-primary">৳540</p>
                  <p className="text-[8px] sm:text-[10px] text-primary/75 font-semibold">per box</p>
                </div>
              </div>

              {/* Large Savings Highlight */}
              <div className="mb-3 bg-gradient-to-r from-accent to-accent/90 text-husk p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-accent/20 flex items-center justify-center gap-2 sm:gap-3 shadow-md shadow-accent/10">
                <span className="text-lg sm:text-xl">🎉</span>
                <div className="text-left">
                  <p className="text-[8px] sm:text-xs font-black uppercase tracking-wider opacity-85">Instant Discount Unlocked</p>
                  <p className="font-black text-xs sm:text-base md:text-lg">You're saving ৳60 on every single box!</p>
                </div>
              </div>

              {/* Sleek Bullet-less Offer Detail Row */}
              <div className="flex items-center justify-center gap-2 mb-5 text-primary bg-primary/5 border border-primary/10 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-black tracking-wide max-w-[280px] sm:max-w-sm mx-auto shadow-inner">
                <CheckCircle size={14} className="text-primary flex-shrink-0" />
                <span>Minimum 2 boxes order required</span>
              </div>

              {/* CTAs */}
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={onClaim}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black text-sm sm:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-primary/30 transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-0.5 cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  Claim Offer & Order Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full hover:bg-slate-100 text-husk/60 hover:text-husk font-extrabold text-[11px] sm:text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromotionPopup;
