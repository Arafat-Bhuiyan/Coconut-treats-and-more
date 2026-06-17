import React, { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "Reviews", href: "#reviews" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-x-0 rounded-b-2xl">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 relative z-50">
                    <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                        Coconut<span className="text-accent-dark underline decoration-accent/30 underline-offset-4">Treats&amp;More</span>
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-husk font-bold">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="hover:text-primary transition-colors">
                            {link.name}
                        </a>
                    ))}
                    <a href="#order" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-husk font-black py-2.5 px-6 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-accent/20">
                        <ShoppingCart size={18} />
                        <span>Quick Order</span>
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4 relative z-50">
                    <a href="#order" className="bg-accent p-2.5 rounded-full text-husk shadow-lg shadow-accent/20" aria-label="Order section">
                        <ShoppingCart size={18} />
                    </a>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-primary p-1"
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
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between bg-secondary/70 p-5 rounded-3xl group active:bg-primary/5 transition-colors"
                        >
                            <span className="text-xl font-black text-husk group-active:text-primary">{link.name}</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
