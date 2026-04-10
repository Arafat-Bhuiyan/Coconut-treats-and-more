import React from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import Testimonials from "./sections/Testimonials/Testimonials";
import Order from "./sections/Order/Order";
import Footer from "./sections/Footer/Footer";

export const Home = () => {
  return (
    <div className="bg-milk-white min-h-screen font-sans selection:bg-accent selection:text-husk">
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
        <Order />
      </main>
      <Footer />
    </div>
  );
};
