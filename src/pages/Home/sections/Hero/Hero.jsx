import React from "react";
import { motion } from "framer-motion";
import puddingImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

const Hero = () => {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 min-h-[90vh] md:min-h-screen flex items-center bg-milk-white overflow-hidden">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left order-2 md:order-1"
        >
          {/* Logo - Hidden on tiny screens, smaller on mobile */}
          <img
            src={logo}
            alt="Logo"
            className="w-[8rem] h-[8rem] sm:w-[12rem] sm:h-[12rem] mx-auto md:mx-0 mb-4 sm:mb-6"
          />

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

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
            <a
              href="#order"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-primary/30 text-center text-lg transform hover:-translate-y-1"
            >
              Order Now
            </a>
            <div className="flex items-center gap-3">
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
