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
        <footer className="bg-primary pt-20 pb-10 px-4 text-milk-white">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-milk-white/10 pb-16 mb-8">
                <div className="md:col-span-5 mt-[-10px]">
                    <h2 className="text-3xl font-bold mb-6 text-accent">Coconut <span className="text-milk-white">Treats & More</span></h2>
                    <p className="text-milk-white/80 leading-relaxed mb-8 text-lg font-medium max-w-sm">
                        Bringing the authentic taste of pure coconut pudding to your doorstep. Handmade with love, fresh every day.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/share/1FXdPxKt9r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-milk-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all">
                            <FacebookIcon size={22} />
                        </a>
                        <a href="https://www.instagram.com/coconuttreatsmore?igsh=MWs0Z3NjZ29pbm96MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-milk-white/10 flex items-center justify-center hover:bg-accent hover:text-husk transition-all">
                            <InstagramIcon size={22} />
                        </a>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <h4 className="font-bold text-xl mb-8 text-accent">Quick Links</h4>
                    <ul className="space-y-4 text-milk-white/70 font-medium">
                        <li><a href="#" className="hover:text-accent transition-colors">Home</a></li>
                        <li><a href="#reviews" className="hover:text-accent transition-colors">Customer Reviews</a></li>
                        <li><a href="#order" className="hover:text-accent transition-colors">Order Now</a></li>
                    </ul>
                </div>

                <div className="md:col-span-4">
                    <h4 className="font-bold text-xl mb-8 text-accent">Contact Us</h4>
                    <ul className="space-y-6 text-milk-white/70 font-medium">
                        <li className="flex items-start gap-4">
                            <div className="bg-milk-white/10 p-2.5 rounded-xl border border-white/5">
                                <Phone size={20} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">Whatsapp</p>
                                <span className="text-milk-white text-lg font-bold">+880 1618 562 844</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-milk-white/10 p-2.5 rounded-xl border border-white/5">
                                <Mail size={20} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">Email Us</p>
                                <span className="text-milk-white">coconuttreatsmore@gmail.com</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-milk-white/10 p-2.5 rounded-xl border border-white/5">
                                <MapPin size={20} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] text-milk-white/40 uppercase font-black mb-1 tracking-widest">Location</p>
                                <span className="text-milk-white">Extension Pallabi, Gate no 4, Mirpur, 1216 Dhaka</span>
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
