import React from "react";
import { motion } from "framer-motion";
import { Gift, Sparkles, Star } from "lucide-react";
import review1 from "../../../../assets/images/reviews/1.jpeg"
import review2 from "../../../../assets/images/reviews/2.jpeg"
import review3 from "../../../../assets/images/reviews/3.jpeg"
import review4 from "../../../../assets/images/reviews/4.jpeg"
import review5 from "../../../../assets/images/reviews/5.jpeg"
import review6 from "../../../../assets/images/reviews/6.jpeg"
import review7 from "../../../../assets/images/reviews/7.jpeg"
import review8 from "../../../../assets/images/reviews/8.jpeg"
import review9 from "../../../../assets/images/reviews/9.jpeg"
import review10 from "../../../../assets/images/reviews/10.jpeg"
import review11 from "../../../../assets/images/reviews/11.jpeg"
import review12 from "../../../../assets/images/reviews/12.jpeg"
import review13 from "../../../../assets/images/reviews/13.jpeg"
import review14 from "../../../../assets/images/reviews/14.jpeg"
import review15 from "../../../../assets/images/reviews/15.jpeg"
import review16 from "../../../../assets/images/reviews/16.jpeg"
import review17 from "../../../../assets/images/reviews/17.jpeg"

const reviewImages = [
    review1, review2, review3, review4, review5, review6, review7, review8,
    review9, review10, review11, review12, review13, review14, review15, review16, review17
];

const Testimonials = () => {
    const [isPaused, setIsPaused] = React.useState(false);

    const MarqueeRow = ({ images, duration = 80 }) => (
        <div
            className="flex overflow-hidden select-none gap-6 py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="flex flex-none gap-6 min-w-full will-change-transform"
                style={{
                    animationPlayState: isPaused ? "paused" : "running"
                }}
            >
                {/* Duplicate images for seamless loop */}
                {[...images, ...images].map((img, idx) => (
                    <div
                        key={idx}
                        className="flex-none w-[220px] md:w-[320px] glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
                    >
                        <img
                            src={img}
                            alt={`Review ${idx}`}
                            className="w-full h-auto object-cover pointer-events-none"
                            loading="lazy"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );

    return (
        <section id="reviews" className="py-24 overflow-hidden relative">
            {/* Promo Banner */}
            {/* Promo Banner - Premium Ticket Style */}
            <div className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
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
                                <Sparkles size={30} sm:size={34} fill="currentColor" className="text-accent" />
                            </div>
                            <div className="space-y-3.5">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                    <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-husk">
                                        Buy More, Save More!
                                    </h4>
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
                                        ৳570 per box
                                    </span>{" "}
                                    automatically! ✨
                                    <span className="block sm:inline-block mt-3 sm:mt-0 sm:ml-3 bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/30 text-husk font-black px-4 py-2 rounded-xl text-sm shadow-sm transform hover:scale-105 transition-all">
                                        🎁 Total ৳60 Discount on 2 boxes!
                                    </span>
                                </p>
                            </div>
                        </div>
                        <a 
                            href="#order" 
                            className="w-full lg:w-auto bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98] shadow-2xl shadow-primary/30 whitespace-nowrap text-center flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            <span>Order Now</span>
                            <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </a>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 md:px-12 mb-10 sm:mb-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-husk mb-4 leading-tight">
                        Happy Customers Review                    </h2>
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
                    <MarqueeRow images={reviewImages} duration={100} />
                </div>
            </div>

            <div className="mt-12 sm:mt-16 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex flex-wrap justify-center items-center gap-3 glass-panel text-primary px-6 py-4 rounded-2xl font-black text-sm sm:text-base will-change-transform"
                >
                    <span className="flex gap-1 text-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} sm:size={18} fill="currentColor" />)}
                    </span>
                    Join our 500+ happy customers
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
