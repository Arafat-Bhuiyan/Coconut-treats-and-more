import React, { useState, useEffect } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import Testimonials from "./sections/Testimonials/Testimonials";
import Order from "./sections/Order/Order";
import Footer from "./sections/Footer/Footer";
import PromotionPopup from "./sections/Hero/PromotionPopup";
import WhatsAppButton from "../../components/WhatsAppButton";

import { trackFacebookEvent } from "../../utils/facebookTracking";

export const Home = () => {
  const [quantity, setQuantity] = useState(1);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // 1. Dynamically initialize and load Meta Pixel script (eliminates render-blocking impact)
    if (!window.fbq) {
      window._fbq = window.fbq = function() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
      
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      window.fbq('init', '939507308912648');
    }

    // 2. Dynamic high-deduplication PageView tracking
    trackFacebookEvent("PageView");

    // 3. Show promotion popup with a non-intrusive delay (prevents PageSpeed audit interruption and improves conversion)
    const hasShownPromo = sessionStorage.getItem("hasShownPromo");
    if (!hasShownPromo) {
      const timer = setTimeout(() => {
        setShowPromo(true);
        sessionStorage.setItem("hasShownPromo", "true");
      }, 10000); // 10 seconds delay
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

