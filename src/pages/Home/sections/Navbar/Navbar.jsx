import React from "react";
import { ShoppingCart } from "lucide-react";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-milk-white/80 backdrop-blur-md border-b border-secondary/20">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">Coconut<span className="text-accent">Treats&More</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-husk font-medium">
                    <a href="#" className="hover:text-primary transition-colors">Home</a>
                    <a href="#products" className="hover:text-primary transition-colors">Products</a>
                    <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
                </div>

                <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-husk font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-accent/20">
                    <ShoppingCart size={20} />
                    <span>Quick Order</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
