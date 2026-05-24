import React from "react";
import { motion } from "framer-motion";
import puddingImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

const Hero = ({ onOpenPromo }) => {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 min-h-[90vh] md:min-h-screen flex items-center bg-milk-white overflow-hidden">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left order-2 md:order-1"
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
            <div className="bg-gradient-to-br from-white/80 via-white/55 to-accent/20 backdrop-blur-xl border-2 border-white/90 rounded-[2.2rem] p-5 sm:p-6 max-w-[310px] sm:max-w-[360px] text-left shadow-[0_20px_50px_rgba(74,103,65,0.18)] hover:shadow-[0_25px_60px_rgba(151,188,98,0.35)] transform hover:scale-[1.03] transition-all duration-300 relative">
              {/* Ticket cutouts aligned with the dashed tear line */}
              <div className="absolute top-[43%] -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-milk-white border-r-2 border-white/90 z-10" />
              <div className="absolute top-[43%] -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-milk-white border-l-2 border-white/90 z-10" />

              {/* Upper Section of Coupon */}
              <div className="pb-3.5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary text-white text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md shadow-primary/20">
                    🔥 BULK DEAL
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-amber-800 bg-[#FEF9C3] px-2.5 py-1.5 rounded-lg border border-amber-300/60 shadow-sm animate-pulse flex items-center gap-1">
                    Save ৳60 / box
                  </span>
                </div>
                <h4 className="font-black text-husk text-lg sm:text-xl leading-tight tracking-tight drop-shadow-sm">
                  Buy More, Save More!
                </h4>
              </div>

              {/* Horizontal Tear Line */}
              <div className="border-t-2 border-dashed border-accent/40 -mx-5 sm:-mx-6 mb-3.5" />

              {/* Lower Section of Coupon */}
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-husk font-extrabold space-y-2 leading-relaxed">
                  <p>
                    Order{" "}
                    <span className="inline-block bg-primary text-white font-black px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap mx-2">2 or more boxes</span>
                    {" "}to unlock the offer.
                  </p>
                  <p>
                    Price drops to{" "}
                    <span className="inline-block bg-accent text-husk font-black px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap border border-accent/30 mx-2">৳540/box</span>
                    {" "}automatically!
                  </p>
                </div>
                <span className="block text-husk bg-gradient-to-r from-accent to-accent/80 border border-white/60 font-black px-3 py-2 rounded-xl text-xs sm:text-sm shadow-md inline-flex items-center gap-1.5 w-full justify-center transform hover:scale-[1.02] transition-transform">
                  ✨ You're saving ৳60 per box!
                </span>
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

            <div className="text-sm sm:text-base text-husk/80 border-l-4 border-accent pl-4 space-y-1 inline-block text-left">
              <p>
                <span className="font-black text-husk">Top layer:</span> Refreshing coconut water &
                coconut chunks
              </p>
              <p>
                <span className="font-black text-husk">Bottom layer:</span> Rich, creamy cow milk.
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
          className="relative order-1 md:order-2 px-4 sm:px-0"
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
            className="absolute -top-4 -right-2 sm:top-10 sm:right-0 bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 border border-secondary/10"
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
