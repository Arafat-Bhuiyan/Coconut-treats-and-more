import React, { useState, useEffect } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import Testimonials from "./sections/Testimonials/Testimonials";
import Order from "./sections/Order/Order";
import Footer from "./sections/Footer/Footer";
import PromotionPopup from "./sections/Hero/PromotionPopup";
import WhatsAppButton from "../../components/WhatsAppButton";

export const Home = () => {
  const [quantity, setQuantity] = useState(1);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const hasShownPromo = sessionStorage.getItem("hasShownPromo");
    if (!hasShownPromo) {
      const timer = setTimeout(() => {
        setShowPromo(true);
        sessionStorage.setItem("hasShownPromo", "true");
      }, 2500); // 2.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const claimOffer = () => {
    setQuantity(2);
    setShowPromo(false);
    setTimeout(() => {
      const element = document.getElementById("order");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="bg-milk-white min-h-screen font-sans selection:bg-accent selection:text-husk">
      <Navbar />
      <main>
        <Hero onOpenPromo={() => setShowPromo(true)} />
        <Testimonials />
        <Order quantity={quantity} setQuantity={setQuantity} />
      </main>
      <Footer />
      <PromotionPopup
        isOpen={showPromo}
        onClose={() => setShowPromo(false)}
        onClaim={claimOffer}
      />
      <WhatsAppButton />
    </div>
  );
};

