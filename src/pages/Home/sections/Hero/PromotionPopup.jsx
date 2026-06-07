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
            className="absolute inset-0 bg-[#161a14]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-white rounded-[2.2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_rgba(74,103,65,0.3)] border border-secondary/10 z-10 no-scrollbar"
          >
            {/* Top Glowing Accent Bar */}
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

            {/* Ticket cutouts aligned with the dashed tear line */}
            <div className="absolute top-[138px] -left-3.5 w-7 h-7 rounded-full bg-[#161a14] z-10 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.15)]" />
            <div className="absolute top-[138px] -right-3.5 w-7 h-7 rounded-full bg-[#161a14] z-10 shadow-[inset_3px_0_5px_rgba(0,0,0,0.15)]" />

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all z-20 shadow-sm border border-slate-100 cursor-pointer flex items-center justify-center"
              aria-label="Close promotion dialog"
            >
              <X size={14} />
            </button>

            {/* Top Branding Section (Upper Ticket Stub) */}
            <div className="px-6 pt-8 pb-4 text-center">
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-3">
                <Sparkles size={11} fill="currentColor" className="animate-pulse text-amber-500" />
                LIMITED TIME DEAL
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-husk leading-tight tracking-tight px-4">
                Super Saver Bulk Offer!
              </h3>
              <p className="text-xs text-husk/50 font-bold mt-1">Don't miss out on these premium savings</p>
            </div>

            {/* Horizontal Coupon Tear Line */}
            <div className="border-t-2 border-dashed border-gray-200 mx-6 my-2" />

            {/* Lower Content Area (Main Ticket Body) */}
            <div className="p-6 pt-4 space-y-5">
              {/* Product Badge Indicator */}
              <div className="flex items-center justify-center gap-2.5 bg-primary/5 border border-primary/10 py-2 px-4 rounded-xl max-w-[280px] mx-auto shadow-inner">
                <span className="text-xl animate-bounce">🥥</span>
                <div className="text-left">
                  <p className="text-[9px] text-husk/50 uppercase font-black tracking-wider">Premium Coconut Pudding</p>
                  <p className="font-extrabold text-husk text-xs">Homemade & 100% Fresh Daily</p>
                </div>
              </div>

              {/* Pricing Comparison Grid */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {/* Regular Price Card */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 text-center shadow-sm flex flex-col justify-center">
                  <p className="text-[10px] text-husk/50 font-black uppercase tracking-wider mb-1">Regular Price</p>
                  <p className="text-xl font-extrabold text-husk/60 line-through">৳600</p>
                  <p className="text-[9px] text-husk/40 font-bold mt-0.5">per box</p>
                </div>

                {/* Offer Price Card */}
                <div className="bg-accent/15 p-4 rounded-2xl border-2 border-accent/60 text-center relative overflow-hidden shadow-sm flex flex-col justify-center">
                  <div className="absolute top-0 right-0 bg-accent text-husk text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    DEAL
                  </div>
                  <p className="text-[10px] text-primary font-black uppercase tracking-wider mb-1">Bulk Offer</p>
                  <p className="text-2xl font-black text-primary">৳570</p>
                  <p className="text-[9px] text-primary/75 font-black mt-0.5">per box</p>
                </div>
              </div>

              {/* Gold Savings Highlight Banner */}
              <div className="bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm">
                <span className="text-2xl">🎉</span>
                <div className="text-left">
                  <p className="text-[9px] font-black text-husk/50 uppercase tracking-widest leading-none">Instant Discount</p>
                  <p className="font-black text-sm sm:text-base text-husk mt-0.5">Total ৳60 Discount on 2 boxes! 🎁</p>
                </div>
              </div>

              {/* Conditions Box */}
              <div className="flex items-center justify-center gap-2 text-primary bg-primary/5 border border-primary/10 rounded-xl py-2.5 px-4 text-xs font-black tracking-wide max-w-[280px] mx-auto shadow-inner">
                <CheckCircle size={14} className="text-primary flex-shrink-0" />
                <span>Minimum 2 boxes order required</span>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onClaim}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black text-base sm:text-lg py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <ShoppingBag size={18} />
                  Claim Offer & Order Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full hover:bg-slate-50 text-husk/60 hover:text-husk font-black text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
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
