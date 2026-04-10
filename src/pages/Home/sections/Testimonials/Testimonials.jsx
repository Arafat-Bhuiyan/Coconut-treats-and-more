import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
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
                className="flex flex-none gap-6 min-w-full"
                style={{
                    animationPlayState: isPaused ? "paused" : "running"
                }}
            >
                {/* Duplicate images for seamless loop */}
                {[...images, ...images].map((img, idx) => (
                    <div
                        key={idx}
                        className="flex-none w-[220px] md:w-[320px] bg-white rounded-2xl overflow-hidden shadow-lg border border-secondary/10 hover:scale-105 transition-transform duration-300"
                    >
                        <img
                            src={img}
                            alt={`Review ${idx}`}
                            className="w-full h-auto object-cover pointer-events-none"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );

    return (
        <section id="reviews" className="py-24 bg-secondary/5 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 mb-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-husk mb-4">
                        Happy Customers Review
                    </h2>
                    <p className="text-husk/60 text-lg">
                        Real messages from real customers. We're grateful for all the love we receive on social media!
                    </p>
                </div>
            </div>

            <div className="relative px-4 md:px-12">
                {/* Gradient Fades for Smooth Edges */}
                <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-secondary/5 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-secondary/5 to-transparent z-20 pointer-events-none" />

                <div className="mx-auto max-w-[1400px]">
                    <MarqueeRow images={reviewImages} duration={120} />
                </div>
            </div>

            <div className="mt-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full font-bold"
                >
                    <span className="flex gap-1 text-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </span>
                    Join our 500+ happy customers
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
