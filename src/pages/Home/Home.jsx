import React, { useEffect } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import WhatsAppButton from "../../components/WhatsAppButton";
import { trackFacebookEvent } from "../../utils/facebookTracking";

import Testimonials from "./sections/Testimonials/Testimonials";
import Footer from "./sections/Footer/Footer";
import StickyMobileOrderBar from "../../components/StickyMobileOrderBar";

export const Home = () => {
  useEffect(() => {
    // 1. Initialize Meta Pixel queue immediately so no events are ever dropped
    if (!window.fbq) {
      window._fbq = window.fbq = function() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
    }

    // Defer external Meta script & PageView network request slightly so initial render has 100% bandwidth
    const pixelTimer = setTimeout(() => {
      if (!document.getElementById('fb-pixel-script')) {
        const script = document.createElement('script');
        script.id = 'fb-pixel-script';
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }

      let cachedUserData = {};
      try {
        const cached = localStorage.getItem("cc_user_data");
        if (cached) cachedUserData = JSON.parse(cached);
      } catch { /* localStorage unavailable or invalid JSON — ignore */ }
      trackFacebookEvent("PageView", {}, cachedUserData);
      trackFacebookEvent("ViewContent", {
        content_name: "Premium Coconut Pudding (6pc Box)",
        content_ids: ["coconut-pudding-6pc"],
        content_type: "product",
        value: 1500,
        currency: "BDT"
      }, cachedUserData);
    }, 1400);

    return () => {
      clearTimeout(pixelTimer);
    };
  }, []);

  return (
    <div className="bg-milk-white min-h-screen font-sans selection:bg-accent selection:text-husk">
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
      </main>
      <Footer />
      <StickyMobileOrderBar />
      <WhatsAppButton />
    </div>
  );
};
