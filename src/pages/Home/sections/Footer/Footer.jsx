import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

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
        <footer className="bg-primary pt-16 sm:pt-20 pb-10 px-4 text-milk-white overflow-hidden">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 border-b border-milk-white/10 pb-12 sm:pb-16 mb-8 text-center md:text-left">
                <div className="md:col-span-5 flex flex-col items-center md:items-start">
                    <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent uppercase tracking-tighter">
                        Coconut <span className="text-milk-white">Treats & More</span>
                    </h2>
                    <p className="text-milk-white/70 leading-relaxed mb-8 text-base sm:text-lg font-medium max-w-sm">
                        Bringing the authentic taste of pure coconut pudding to your doorstep. Handmade with love, fresh every day.
                    </p>
                    
                    <div className="flex gap-4 mb-8">
                        <a href="https://www.facebook.com/share/1FXdPxKt9r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all group">
                            <FacebookIcon size={22} className="group-hover:scale-110 transition-transform" />
                        </a>
                        <a href="https://www.instagram.com/coconuttreatsmore?igsh=MWs0Z3NjZ29pbm96MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all group">
                            <InstagramIcon size={22} className="group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </div>

                <div className="md:col-span-3 flex flex-col items-center md:items-start">
                    <h4 className="text-accent font-black text-xs uppercase tracking-widest mb-6">Explore</h4>
                    <ul className="space-y-4 font-bold text-sm sm:text-base">
                        <li><a href="#" className="text-milk-white/60 hover:text-accent transition-colors">Home</a></li>
                        <li><a href="#reviews" className="text-milk-white/60 hover:text-accent transition-colors">Customer Reviews</a></li>
                        <li><a href="#order" className="text-milk-white/60 hover:text-accent transition-colors font-black">Order Now</a></li>
                    </ul>
                </div>

                <div className="md:col-span-4 flex flex-col items-center md:items-start">
                    <h4 className="text-accent font-black text-xs uppercase tracking-widest mb-6">Quick Contact</h4>
                    <ul className="space-y-6 w-full max-w-[280px] md:max-w-none">
                        <li className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                                <Phone size={20} className="text-accent" />
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">WhatsApp</p>
                                <span className="text-milk-white text-base sm:text-lg font-black tracking-tight">+880 1618 562 844</span>
                            </div>
                        </li>
                        <li className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                                <Mail size={20} className="text-accent" />
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">Email Us</p>
                                <span className="text-milk-white text-sm sm:text-base font-bold break-all">coconuttreatsmore@gmail.com</span>
                            </div>
                        </li>
                        <li className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                                <MapPin size={20} className="text-accent" />
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">Location</p>
                                <span className="text-milk-white text-sm font-bold">Extension Pallabi, Gate 4, Mirpur, Dhaka</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto flex flex-col md:row items-center justify-between text-milk-white/40 text-xs font-medium tracking-wider uppercase">
                <p>&copy; 2026 Coconut Treats & More. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
