import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "../../../../assets/images/coconuts-treats-more-logo.png";

const FacebookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
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
                        {/* Facebook - Official Blue */}
                        <a
                            href="https://www.facebook.com/share/1FXdPxKt9r/?mibextid=wwXIfr"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Follow us on Facebook"
                            style={{ backgroundColor: '#1877F2', boxShadow: '0 4px 18px rgba(24,119,242,0.45)' }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(24,119,242,0.7)] active:scale-95"
                        >
                            <FacebookIcon size={26} />
                        </a>
                        {/* Instagram - Official Gradient */}
                        <a
                            href="https://www.instagram.com/coconuttreatsmore?igsh=MWs0Z3NjZ29pbm96MQ%3D%3D&utm_source=qr"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Follow us on Instagram"
                            style={{ background: 'radial-gradient(circle at 30% 110%, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', boxShadow: '0 4px 18px rgba(220,39,67,0.45)' }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(188,24,136,0.65)] active:scale-95"
                        >
                            <InstagramIcon size={26} />
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
