import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import WhatsAppButton from "../../components/WhatsAppButton";
import { trackFacebookEvent } from "../../utils/facebookTracking";

// Lazy load below-the-fold components to reduce initial page load payload
const Testimonials = lazy(() => import("./sections/Testimonials/Testimonials"));
const Order = lazy(() => import("./sections/Order/Order"));
const Footer = lazy(() => import("./sections/Footer/Footer"));
const PromotionPopup = lazy(() => import("./sections/Hero/PromotionPopup"));

// Simple elegant loading fallbacks
const SectionLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center bg-milk-white">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
    }

    // 2. Dynamic high-deduplication PageView tracking
    // Also pass cached user data for returning visitors to improve Advanced Matching on PageView
    let cachedUserData = {};
    try {
      const cached = localStorage.getItem("cc_user_data");
      if (cached) cachedUserData = JSON.parse(cached);
    } catch (e) {}
    trackFacebookEvent("PageView", {}, cachedUserData);

    // 3. Show popup ONLY after real user interaction (guards against Lighthouse/bots)
    //    Bots never scroll or touch → popup never shows → LCP unaffected
    //    Real users interact within seconds → popup shows 3s after first interaction
    const hasShownPromo = sessionStorage.getItem("hasShownPromo");
    if (!hasShownPromo) {
      let promoScheduled = false;
      let promoTimer = null;

      const schedulePromo = () => {
        if (promoScheduled) return;
        promoScheduled = true;
        const events = ['scroll', 'touchstart', 'mousemove', 'pointerdown'];
        events.forEach(e => window.removeEventListener(e, schedulePromo));
        promoTimer = setTimeout(() => {
          setShowPromo(true);
          sessionStorage.setItem("hasShownPromo", "true");
        }, 3000);
      };

      const events = ['scroll', 'touchstart', 'mousemove', 'pointerdown'];
      events.forEach(e => window.addEventListener(e, schedulePromo, { passive: true }));

      return () => {
        if (promoTimer) clearTimeout(promoTimer);
        events.forEach(e => window.removeEventListener(e, schedulePromo));
      };
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
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Order quantity={quantity} setQuantity={setQuantity} />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <PromotionPopup
          isOpen={showPromo}
          onClose={() => setShowPromo(false)}
          onClaim={claimOffer}
        />
      </Suspense>
      <WhatsAppButton />
    </div>
  );
};

