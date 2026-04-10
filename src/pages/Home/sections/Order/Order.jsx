import React from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";

const Order = () => {
    return (
        <section className="py-24 px-4 bg-milk-white overflow-hidden">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-husk mb-6">Simple Pricing, <br />Pure Delight</h2>
                        <p className="text-husk/70 mb-10 max-w-md leading-relaxed">
                            We focus on quality. We prepare everything fresh based on daily orders to ensure maximum freshness.
                        </p>

                        <div className="bg-pure-coconut p-8 rounded-3xl border-2 border-primary/20 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-primary text-milk-white px-6 py-2 rounded-bl-2xl font-bold text-sm">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-bold text-husk mb-2">Standard Box</h3>
                            <p className="text-husk/50 mb-6 font-medium">10 serving box</p>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-bold text-primary">৳250</span>
                                <span className="text-husk/40 line-through">৳450</span>
                                <span className="text-accent text-sm font-bold ml-2">Special Offer</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Freshly made every morning",
                                    "Eco-friendly packaging",
                                    "Next day delivery",
                                    "100% money back guarantee"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-husk/80 font-medium">
                                        <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-pure-coconut p-10 rounded-[2.5rem] shadow-2xl border border-secondary/10"
                    >
                        <h3 className="text-2xl font-bold text-husk mb-8">Place Your Order</h3>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-husk/70">Full Name</label>
                                    <input type="text" placeholder="Your Name" className="w-full bg-milk-white border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-husk/70">Phone Number</label>
                                    <input type="tel" placeholder="01XXX-XXXXXX" className="w-full bg-milk-white border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-husk/70">Delivery Address</label>
                                <textarea rows="3" placeholder="Where should we deliver?" className="w-full bg-milk-white border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium resize-none"></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-husk/70">Quantity</label>
                                <select className="w-full bg-milk-white border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium appearance-none">
                                    <option>1 Box (10 pcs) - ৳250</option>
                                    <option>2 Boxes (20 pcs) - ৳450</option>
                                    <option>5 Boxes (50 pcs) - ৳1000</option>
                                </select>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-xs text-primary font-bold mb-2 uppercase tracking-wider">Payment Instruction</p>
                                <p className="text-sm text-husk/70">Send money to bKash: <span className="font-bold text-husk">017XXXXXXXX</span>. Personal and write the Transaction ID below.</p>
                                <input type="text" placeholder="Transaction ID" className="w-full mt-3 bg-pure-coconut border border-secondary/20 rounded-lg px-4 py-2 outline-none focus:border-primary transition-colors text-sm" />
                            </div>

                            <button className="w-full bg-accent hover:bg-accent/90 text-husk font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-accent/20">
                                <span>Place Order via WhatsApp</span>
                                <Send size={18} />
                            </button>
                            <p className="text-[10px] text-center text-husk/40 uppercase font-bold tracking-widest">You will be redirected to WhatsApp to confirm details</p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Order;
