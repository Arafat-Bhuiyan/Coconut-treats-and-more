import React, { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "Reviews", href: "#reviews" },
    ];

    const scrollToOrder = (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setIsOpen(false);
        const orderEl = document.getElementById('order-form-details') || document.getElementById('order');
        if (orderEl) {
            const navOffset = 90;
            const targetY = orderEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        } else {
            window.location.hash = "#order-form-details";
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-x-0 rounded-b-2xl">
            {/* Top Announcement Bar */}
            <div className="bg-[#4A6741] text-white text-center text-[10px] sm:text-xs font-black tracking-wider uppercase py-2 px-3 sm:px-4 flex items-center justify-center gap-2 shadow-sm">
                <span>🚚</span>
                <span>FREE DELIVERY ON 5+ BOXES! (DHAKA CITY)</span>
            </div>
            <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 relative z-50 min-w-0">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-base sm:text-xl md:text-2xl font-black text-primary tracking-tight cursor-pointer no-underline select-none whitespace-nowrap"
                    >
                        Coconut <span className="text-secondary font-black">Treats &amp; More</span>
                    </a>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-husk font-bold">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => {
                                if (link.href === "#") {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else if (link.href.startsWith("#")) {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="hover:text-primary transition-colors cursor-pointer"
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        href="#order"
                        onClick={scrollToOrder}
                        style={{ touchAction: 'manipulation' }}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-husk font-black py-2.5 px-6 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-accent/20 cursor-pointer select-none"
                    >
                        <ShoppingCart size={18} />
                        <span>Quick Order</span>
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4 relative z-50">
                    <a
                        href="#order"
                        onClick={scrollToOrder}
                        style={{ touchAction: 'manipulation' }}
                        className="bg-accent p-2.5 rounded-full text-husk shadow-lg shadow-accent/20 cursor-pointer select-none active:scale-95 transition-transform"
                        aria-label="Order section"
                    >
                        <ShoppingCart size={18} />
                    </a>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ touchAction: 'manipulation' }}
                        className="text-primary p-1 cursor-pointer select-none"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer — CSS animated, no Framer Motion */}
            <div
                style={{
                    transition: "opacity 0.25s ease, transform 0.25s ease",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "scale(1)" : "scale(1.06)",
                    pointerEvents: isOpen ? "auto" : "none",
                }}
                className="fixed inset-0 bg-white/70 z-40 flex flex-col pt-28 px-6 md:hidden backdrop-blur-2xl"
            >
                <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => {
                                setIsOpen(false);
                                if (link.href === "#") {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else if (link.href.startsWith("#")) {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="flex items-center justify-between bg-secondary/70 p-5 rounded-3xl group active:bg-primary/5 transition-colors cursor-pointer select-none"
                        >
                            <span className="text-xl font-black text-husk group-active:text-primary">{link.name}</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                        </a>
                    ))}
                    <a
                        href="#order"
                        onClick={scrollToOrder}
                        style={{ touchAction: 'manipulation' }}
                        className="flex items-center justify-center gap-2 bg-primary active:bg-primary-dark text-white p-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/25 mt-2 cursor-pointer select-none transition-all active:scale-[0.98]"
                    >
                        <ShoppingCart size={20} />
                        <span>অর্ডার করুন (Order Now)</span>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
