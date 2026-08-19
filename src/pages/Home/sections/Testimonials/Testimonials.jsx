import { Sparkles, Star } from "lucide-react";
import CountdownTimer from "../../../../components/CountdownTimer";

// Use dynamic paths instead of static imports to reduce bundle size
const reviewImages = Array.from({ length: 17 }, (_, i) => `/reviews/${i + 1}.webp`);

// Moved outside Testimonials to prevent recreation on every render (performance fix)
const MarqueeRow = ({ images, duration = 30 }) => (
    <div className="flex overflow-hidden select-none gap-6 py-4">
        <div className="reviews-marquee gap-6 min-w-full" style={{ animationDuration: `${duration}s` }}>
            {/* Original set */}
            {images.map((img, idx) => (
                <div
                    key={`orig-${idx}`}
                    className="flex-none w-[180px] sm:w-[240px] md:w-[300px] glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                    <img
                        src={img}
                        alt={`Review ${idx}`}
                        className="w-full h-auto object-cover pointer-events-none"
                        loading="lazy"
                    />
                </div>
            ))}
            {/* Duplicate set for infinite loop */}
            {images.map((img, idx) => (
                <div
                    key={`dup-${idx}`}
                    className="flex-none w-[180px] sm:w-[240px] md:w-[300px] glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                    <img
                        src={img}
                        alt={`Review Duplicate ${idx}`}
                        className="w-full h-auto object-cover pointer-events-none"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    </div>
);

const Testimonials = () => {
    return (
        <section id="reviews" className="py-24 overflow-hidden relative">
            <style>
                {`
                  @keyframes scrollReviews {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                  }
                  .reviews-marquee {
                    display: flex;
                    animation: scrollReviews var(--marquee-duration, 30s) linear infinite;
                    will-change: transform;
                  }
                  .reviews-marquee:hover {
                    animation-play-state: paused;
                  }
                `}
            </style>
            {/* Promo Banner - Premium Ticket Style */}
            <div className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
                <div
                    className="relative glass-panel p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-husk overflow-hidden transition-all duration-300 group will-change-transform"
                >
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

                    {/* Ticket cutouts aligned with the layout */}
                    <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#F6F8F5] z-10 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.06)]" />
                    <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#F6F8F5] z-10 shadow-[inset_3px_0_5px_rgba(0,0,0,0.06)]" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                        <div className="flex items-center gap-4 sm:gap-6 text-center md:text-left flex-col md:flex-row">
                            <div className="bg-primary/5 p-4 rounded-2xl sm:rounded-3xl border border-primary/10 shadow-sm flex-shrink-0 animate-pulse text-primary">
                                <Sparkles size={30} fill="currentColor" className="text-accent" />
                            </div>
                            <div className="space-y-3.5">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-husk">
                                        Buy More, Save More!
                                    </div>
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm animate-pulse">
                                        🎁 SUPER SAVER
                                    </span>
                                </div>
                                
                                <p className="text-sm sm:text-base md:text-lg text-husk max-w-2xl font-black leading-relaxed text-center md:text-left">
                                    Order{" "}
                                    <span className="bg-primary text-white font-black px-2.5 py-1 rounded-xl shadow-md shadow-primary/20 whitespace-nowrap inline-block transform hover:scale-105 transition-all">
                                        2 or more boxes
                                    </span>{" "}
                                    to unlock 💰{" "}
                                    Price drops to{" "}
                                    <span className="bg-accent/20 text-primary font-black px-2.5 py-1 rounded-xl border border-accent/30 shadow-sm whitespace-nowrap inline-block transform hover:scale-105 transition-all">
                                        ৳625 per box
                                    </span>{" "}
                                    automatically! ✨
                                    <span className="block sm:inline-block mt-3 sm:mt-0 sm:ml-3 font-black px-4 py-3 rounded-xl transform hover:scale-105 transition-all relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4A6741 0%, #5A7336 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 6px 20px rgba(74, 103, 65, 0.35), inset 0 1px 0 rgba(255,255,255,0.45)'}}>
                                        <span className="absolute inset-0 rounded-xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)', pointerEvents: 'none'}} />
                                        <span className="relative z-10 flex flex-col items-center gap-0.5">
                                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>🎁 Instant Discount</span>
                                          <span className="text-sm sm:text-base font-black text-white" style={{textShadow: '0 1.5px 3px rgba(0,0,0,0.4)'}}>🎉 ২ টি বাক্স একসাথে কিনলেই ১৫০ টাকা ছাড়!</span>
                                        </span>
                                    </span>
                                </p>

                                {/* Countdown Timer */}
                                <div className="flex justify-center md:justify-start pt-1">
                                    <CountdownTimer layout="row" className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/60 shadow-sm" />
                                </div>
                            </div>
                        </div>
                        <a 
                            href="#order" 
                            style={{ touchAction: 'manipulation' }}
                            className="w-full lg:w-auto bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary/30 whitespace-nowrap text-center flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer select-none"
                        >
                            <span className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            <span>Order Now</span>
                            <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-12 mb-10 sm:mb-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-husk mb-4 leading-tight">
                        Happy Customers Review
                    </h2>
                    <p className="text-husk/60 text-sm sm:text-base md:text-lg font-medium">
                        We're grateful for all the love we receive on social media!
                    </p>
                </div>
            </div>

            <div className="relative px-2 sm:px-4 md:px-12">
                {/* Gradient Fades for Smooth Edges */}
                <div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-32 bg-gradient-to-r from-secondary/5 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-32 bg-gradient-to-l from-secondary/5 to-transparent z-20 pointer-events-none" />

                <div className="mx-auto max-w-[1400px]">
                    <MarqueeRow images={reviewImages} duration={30} />
                </div>
            </div>

            <div className="mt-12 sm:mt-16 text-center px-4">
                <div
                    className="inline-flex flex-wrap justify-center items-center gap-3 glass-panel text-primary px-6 py-4 rounded-2xl font-black text-sm sm:text-base will-change-transform"
                >
                    <span className="flex gap-1 text-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </span>
                    Join our 500+ happy customers
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
