import React from "react";
import { motion } from "framer-motion";
import puddingImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

const Hero = ({ onOpenPromo }) => {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left order-2 md:order-1 will-change-transform"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14 md:gap-16 mb-8 justify-center md:justify-start w-full">
            {/* Logo */}
            <img
              src={logo}
              alt="Logo"
              className="w-[8rem] h-[8rem] sm:w-[9.5rem] sm:h-[9.5rem] object-contain flex-shrink-0"
              fetchpriority="high"
              width={152}
              height={152}
            />
            
            {/* Coupon Promo Card Next to Logo */}
            <div className="relative glass-card rounded-[2rem] max-w-[310px] sm:max-w-[350px] text-left transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              
              {/* Top Accent Bar */}
              <div className="bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

              {/* Ticket cutouts aligned with the dashed tear line */}
              <div className="absolute top-[52%] -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-milk-white z-10 shadow-inner" />
              <div className="absolute top-[52%] -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-milk-white z-10 shadow-inner" />

              {/* Upper Section */}
              <div className="px-5 sm:px-6 pt-4 pb-4">
                {/* Badges Row */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md shadow-primary/30 flex items-center gap-1">
                    🔥 BULK DEAL
                  </span>
                  <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-sm animate-pulse">
                    Save ৳30 / box
                  </span>
                </div>

                {/* Headline */}
                <h4 className="font-black text-husk text-xl sm:text-2xl leading-tight tracking-tight mb-1">
                  Buy More, Save More!
                </h4>
                <p className="text-xs text-husk/50 font-bold">Special bulk discount offer</p>
              </div>

              {/* Horizontal Tear Line */}
              <div className="border-t-2 border-dashed border-gray-200 mx-5 sm:mx-6 my-1" />

              {/* Lower Section */}
              <div className="px-5 sm:px-6 pt-4 pb-5 space-y-3">
                {/* Info Rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">📦</span>
                    <p className="text-xs sm:text-sm text-husk font-bold">
                      Order <span className="font-black text-primary">2 or more boxes</span> to unlock
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center font-black text-sm flex-shrink-0">💰</span>
                    <p className="text-xs sm:text-sm text-husk font-bold">
                      Price drops to <span className="font-black text-primary">৳570/box</span> automatically!
                    </p>
                  </div>
                </div>

                {/* Bottom Savings Banner */}
                <div className="bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/30 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-black text-husk">You're saving ৳30 per box!</span>
                </div>
              </div>
            </div>

          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-primary font-black text-xs sm:text-sm mb-6 uppercase tracking-wider">
            🌿 100% Natural Ingredients
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-husk leading-[1.1] mb-6">
            Fresh Homemade <br />
            <span className="text-primary underline-offset-8">Premium Coconut Pudding</span>
          </h1>

          <div className="space-y-5 mb-8 max-w-lg mx-auto md:mx-0">
            <p className="text-base sm:text-lg text-husk/80 leading-relaxed">
              Made with <span className="text-primary font-bold">fresh coconut water</span>,{" "}
              <span className="text-primary font-bold">authentic cow milk</span>, and{" "}
              <span className="text-primary font-bold">imported agar-agar. 100% Halal | No
              added preservatives</span>
            </p>

            <div className="text-sm sm:text-base text-husk/80 border-l-4 border-accent pl-4 space-y-1.5 inline-block text-left">
              <p>
                <span className="font-black text-husk">Top layer:</span> Refreshing coconut water &
                coconut chunks
              </p>
              <p>
                <span className="font-black text-husk">Bottom layer:</span> Rich, creamy cow milk.
              </p>
              <p>
                <span className="font-black text-husk">❄️ Shelf life:</span>{" "}
                <span className="font-black text-primary">5 days</span>{" "}
                <span className="font-bold text-husk/80">(Keep refrigerated, not in deep freezer)</span>
              </p>
              <p>
                <span className="font-black text-husk">Note:</span>{" "}
                <span className="font-bold text-husk/80">Mild Sugar Added — Perfectly balanced, not overly sweet.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-start">
            <a
              href="#order"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-primary/30 text-center text-lg transform hover:-translate-y-1"
            >
              Order Now
            </a>
            
            {/* Glowing Promo Badge Trigger */}
            <button
              onClick={onOpenPromo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent/90 hover:from-accent-dark hover:to-accent text-husk font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-accent/20 text-center text-base border-2 border-accent/40 transform hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-white/10 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="animate-pulse">🎁</span>
              <span>Claim Bulk Offer</span>
            </button>

            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt="user"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-husk/60">
                <span className="text-primary font-black">500+</span> Customers
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative order-1 md:order-2 px-4 sm:px-0 will-change-transform"
        >
          <div className="absolute -inset-4 bg-secondary/10 rounded-full -z-10 animate-pulse"></div>
          <img
            src={puddingImg}
            alt="Delicious Coconut Pudding"
            className="w-full h-auto shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] sm:rounded-[4rem]"
            fetchpriority="high"
            width={640}
            height={640}
          />

          {/* Floating Badge */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-2 sm:top-10 sm:right-0 glass-panel p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-3 will-change-transform"
          >
            <div className="bg-accent/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <span className="text-xl sm:text-2xl">🥥</span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-husk/50 uppercase font-black tracking-widest">
                Made Fresh
              </p>
              <p className="font-black text-husk text-sm sm:text-base">Every Morning</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
