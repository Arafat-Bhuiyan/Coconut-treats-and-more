import React from "react";
import CountdownTimer from "../../../../components/CountdownTimer";

// Use stable public/ paths — not hashed by Vite, works in both dev & production
const puddingImg = "/pudding-3d.jpg";
const logo = "/logo.webp";

const Hero = ({ onOpenPromo }) => {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .hero-text-col { animation: fadeInUp 0.5s ease both; }
        .hero-float-badge { animation: floatBadge 4s ease-in-out infinite; will-change: transform; }
      `}</style>
      <div className="container mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-start">
        <div
          className="text-center md:text-left order-2 md:order-1 hero-text-col"
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
                  <span className="text-[11px] font-black px-2.5 py-1.5 rounded-lg animate-pulse relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4A6741 0%, #5A7336 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 15px rgba(74, 103, 65, 0.35), inset 0 1px 0 rgba(255,255,255,0.45)', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>
                    🎉 ২টি বাক্স কিনলেই ৳১২০ ছাড়!
                  </span>
                </div>

                {/* Headline */}
                <div className="font-black text-husk text-xl sm:text-2xl leading-tight tracking-tight mb-1">
                  🎉 ২টি বাক্স কিনলেই ৳১২০ ছাড়!
                </div>
                <p className="text-xs text-husk/50 font-bold">আজই ২টি বাক্স অর্ডার করুন এবং সঙ্গে সঙ্গে ৳১২০ ছাড় উপভোগ করুন।</p>
              </div>

              {/* Horizontal Tear Line */}
              <div className="border-t-2 border-dashed border-gray-200 mx-5 sm:mx-6 my-1" />

              {/* Lower Section */}
              <div className="px-5 sm:px-6 pt-4 pb-5 space-y-3">
                {/* Info Rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">📦</span>
                    <p className="text-xs sm:text-sm text-husk font-black">
                      Order 2 or more boxes to unlock 💰
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center font-black text-sm flex-shrink-0">💰</span>
                    <p className="text-xs sm:text-sm text-husk font-black">
                      Price drops to ৳540 per box automatically! ✨
                    </p>
                  </div>
                </div>

                {/* Bottom Savings Banner */}
                <div className="rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-0.5 mt-1 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4A6741 0%, #5A7336 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 6px 20px rgba(74, 103, 65, 0.35), inset 0 1px 0 rgba(255,255,255,0.45)'}}>
                  <span className="absolute inset-0 rounded-xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)', pointerEvents: 'none'}} />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <span className="text-xl">🎁</span>
                    <span className="text-base sm:text-lg font-black leading-tight text-white" style={{textShadow: '0 1.5px 3px rgba(0,0,0,0.4)'}}>
                      Instant Discount
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-black relative z-10 text-center text-white" style={{textShadow: '0 1.5px 3px rgba(0,0,0,0.4)'}}>
                    🎉 ২টি বাক্স কিনলেই ৳১২০ ছাড়!
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="mt-3.5 pt-3 border-t border-dashed border-gray-200/50 flex items-center justify-center w-full">
                  <CountdownTimer />
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
              <p className="text-xs sm:text-sm mt-0.5 opacity-85">
                <span className="font-bold text-husk/90">Note:</span>{" "}
                <span className="font-medium text-husk/70">Mild Sugar Added — Perfectly balanced, not overly sweet.</span>
              </p>
              <p className="text-xs mt-0.5 font-semibold text-primary">
                Every box comes with 6 delicious pieces.
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
              type="button"
              onClick={onOpenPromo}
              style={{ touchAction: 'manipulation' }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent/90 hover:from-accent-dark hover:to-accent text-husk font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-accent/20 text-center text-base border-2 border-accent/40 group relative overflow-hidden cursor-pointer select-none"
            >
              <span className="absolute inset-0 bg-white/10 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="animate-pulse">🎁</span>
              <span>Claim Bulk Offer</span>
            </button>

            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <div className="flex -space-x-2">
                {["#4A6741","#97BC62","#8DA47E","#C8D5B9"].map((color, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-xs"
                    style={{ backgroundColor: color }}
                  >
                    {["A","R","F","T"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-husk/60">
                <span className="text-primary font-black">500+</span> Customers
              </p>
            </div>
          </div>
        </div>

        <div
          className="relative order-1 md:order-2 px-4 sm:px-0"
        >
          <div className="absolute -inset-4 bg-secondary/10 rounded-full -z-10"></div>
          <img
            src={puddingImg}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="Delicious Coconut Pudding"
            className="w-[85%] sm:w-[75%] lg:w-[70%] h-auto mx-auto block shadow-[0_24px_48px_rgba(0,0,0,0.12)] rounded-[2.5rem] sm:rounded-[3.5rem]"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            width={640}
            height={640}
          />

          {/* Floating Badge */}
          <div
            className="hero-float-badge absolute -top-4 -right-2 sm:top-10 sm:right-0 glass-panel p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-3"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
