import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const FacebookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const TwitterIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
);

const InstagramIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);

const Footer = () => {
    return (
        <footer className="bg-primary pt-20 pb-10 px-4 text-milk-white">
            <div className="container mx-auto grid md:grid-cols-4 gap-12 border-b border-milk-white/10 pb-16 mb-8">
                <div className="md:col-span-1">
                    <h2 className="text-3xl font-bold mb-6 italic text-accent">Coconut <span className="text-milk-white">Treats & More</span></h2>
                    <p className="text-milk-white/70 leading-relaxed mb-8">
                        Bringing the authentic taste of pure coconut pudding to your doorstep. Handmade with love, fresh every day.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-milk-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all">
                            <FacebookIcon size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-milk-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all">
                            <InstagramIcon size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-milk-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all">
                            <TwitterIcon size={20} />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-xl mb-6">Quick Links</h4>
                    <ul className="space-y-4 text-milk-white/70">
                        <li><a href="#" className="hover:text-accent transition-colors">Home</a></li>
                        <li><a href="#products" className="hover:text-accent transition-colors">Our Products</a></li>
                        <li><a href="#reviews" className="hover:text-accent transition-colors">Customer Reviews</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xl mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-milk-white/70">
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-accent" />
                            <span>+880 1711 XXX XXX</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-accent" />
                            <span>hello@cocodelight.com</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm">
                            <MapPin size={18} className="text-accent" />
                            <span className="leading-tight">Gulshan-1, Dhaka, Bangladesh</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xl mb-6">Follow Us</h4>
                    <p className="text-sm text-milk-white/70 mb-6 font-medium">
                        Stay updated with our newest flavors and special discounts.
                    </p>
                    <div className="relative">
                        <input type="email" placeholder="Your email" className="w-full bg-milk-white/10 border border-milk-white/20 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-sm" />
                        <button className="absolute right-2 top-2 bg-accent text-husk px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-accent/90 transition-all">
                            Join
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto flex flex-col md:row items-center justify-between text-milk-white/40 text-xs font-medium tracking-wider uppercase">
                <p>&copy; 2026 Coconut Treats & More. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-milk-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-milk-white transition-colors">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
