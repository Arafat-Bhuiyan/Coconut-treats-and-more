import { Sparkles, Star } from "lucide-react";

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
                        decoding="async"
                        width={300}
                        height={200}
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
                        decoding="async"
                        width={300}
                        height={200}
                    />
                </div>
            ))}
        </div>
    </div>
);

const Testimonials = () => {
    return (
        <section id="reviews" className="scroll-mt-24 py-24 overflow-hidden relative">
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
            {/* Fresh Homemade Pudding Craftsmanship & Ingredients Section */}
            <div className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
                <div className="relative bg-white/95 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-[#4A6741]/20 shadow-md overflow-hidden">
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-[#4A6741] via-[#8DA47E] to-[#4A6741] h-2 w-full" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                        <div className="space-y-4 max-w-3xl text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#4A6741] border border-[#4A6741]/25 font-black text-xs uppercase tracking-wider">
                                    <Sparkles size={13} /> 100% Natural Ingredients
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs uppercase tracking-wider">
                                    🥥 Fresh Made Every Morning
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F291E] tracking-tight leading-tight">
                                Fresh Homemade <span className="text-[#4A6741]">Premium Coconut Pudding</span>
                            </h2>

                            <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium leading-relaxed">
                                Made with <strong className="text-[#4A6741] font-black">fresh coconut water</strong>, <strong className="text-[#4A6741] font-black">authentic cow milk</strong>, and <strong className="text-[#4A6741] font-black">imported agar-agar</strong>.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="bg-[#F4F7F2] p-3.5 rounded-2xl border border-[#4A6741]/15 text-left flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">🥥</span>
                                    <div>
                                        <span className="text-[11px] font-black uppercase text-[#4A6741] tracking-wider block">Top Layer</span>
                                        <p className="text-xs sm:text-sm font-bold text-[#1F291E] leading-snug">Refreshing coconut water with tender coconut chunks</p>
                                    </div>
                                </div>
                                <div className="bg-[#F4F7F2] p-3.5 rounded-2xl border border-[#4A6741]/15 text-left flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">🥛</span>
                                    <div>
                                        <span className="text-[11px] font-black uppercase text-[#4A6741] tracking-wider block">Bottom Layer</span>
                                        <p className="text-xs sm:text-sm font-bold text-[#1F291E] leading-snug">Rich, silky smooth pure cow milk pudding</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 italic font-semibold pt-1">
                                &ldquo;Creamy, refreshing dessert that melts in your mouth. Perfectly balanced sweetness for your healthy lifestyle.&rdquo;
                            </p>
                        </div>

                        <div className="flex-shrink-0 w-full lg:w-auto">
                            <a 
                                href="#order"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                style={{ touchAction: 'manipulation' }}
                                className="w-full lg:w-auto bg-[#4A6741] hover:bg-[#3E5837] active:scale-[0.98] text-white px-8 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl shadow-[#4A6741]/25 whitespace-nowrap text-center flex items-center justify-center gap-2 group cursor-pointer select-none"
                            >
                                <span>Order Now</span>
                                <span className="group-hover:translate-x-1 transition-transform">➔</span>
                            </a>
                        </div>
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

            <div className="mt-12 sm:mt-16 text-center px-4 space-y-5">
                <div
                    className="inline-flex flex-wrap justify-center items-center gap-3 glass-panel text-primary px-6 py-4 rounded-2xl font-black text-sm sm:text-base will-change-transform shadow-md"
                >
                    <span className="flex gap-1 text-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </span>
                    Join our 1,000+ happy customers in Dhaka!
                </div>

                <div>
                    <a
                        href="#order"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        style={{ touchAction: 'manipulation' }}
                        className="inline-flex items-center gap-2.5 bg-[#4A6741] hover:bg-[#3E5837] active:scale-95 text-white font-black px-8 sm:px-10 py-4 rounded-2xl shadow-xl shadow-[#4A6741]/30 hover:scale-105 transition-all text-base sm:text-lg uppercase tracking-wider select-none cursor-pointer"
                    >
                        <span>🛒 ORDER NOW • অর্ডার করুন</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
