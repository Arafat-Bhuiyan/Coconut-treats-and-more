import React from "react";
import { motion } from "framer-motion";
import puddingImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

const Hero = () => {
    return (
        <section className="pt-32 pb-20 px-4 min-h-screen flex items-center bg-milk-white">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Logo */}
                    <img src={logo} alt="Logo" className="w-[12rem] h-[12rem]" />
                    <span className="inline-block px-4 py-1 rounded-full bg-secondary/20 text-primary font-bold text-sm mb-6">
                        100% Natural Ingredients
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-husk leading-tight mb-6">
                        Fresh Homemade <br />
                        <span className="text-primary">Premium Coconut Pudding</span>
                    </h1>
                    <div className="space-y-5 mb-8 max-w-lg text-left">
                        <p className="text-lg text-husk/90 leading-relaxed">
                            Made with <span className="text-primary font-bold">fresh coconut water</span>, <span className="text-primary font-bold">authentic cow milk</span>, and <span className="text-primary font-bold">imported agar-agar</span> jelly powder.
                        </p>
                        <div className="text-base text-husk/80 border-l-4 border-accent pl-4 space-y-1">
                            <p><span className="font-bold text-husk">Top layer:</span> Refreshing coconut water with coconut chunks</p>
                            <p><span className="font-bold text-husk">Bottom layer:</span> Rich, creamy cow milk.</p>
                        </div>
                        <p className="text-sm text-husk/60 italic font-medium">
                            Creamy, refreshing dessert that melts in your mouth. Perfectly balanced sweetness for your healthy lifestyle.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-primary hover:bg-primary/90 text-milk-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-primary/20">
                            Order Now on WhatsApp
                        </button>
                        <div className="flex items-center gap-3 px-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-milk-white bg-secondary/40 flex items-center justify-center text-xs font-bold text-husk overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-husk/70">
                                <span className="text-primary font-bold">500+</span> happy customers
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
                    <img
                        src={puddingImg}
                        alt="Delicious Coconut Pudding"
                        className="w-full h-auto drop-shadow-2xl rounded-3xl"
                    />
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 right-0 bg-pure-coconut p-4 rounded-xl shadow-xl flex items-center gap-3 border border-secondary/10"
                    >
                        <div className="bg-accent/20 p-2 rounded-lg">
                            <span className="text-2xl">🥥</span>
                        </div>
                        <div>
                            <p className="text-xs text-husk/60">Made Fresh</p>
                            <p className="font-bold text-husk">Every Morning</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
