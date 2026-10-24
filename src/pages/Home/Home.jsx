import React, { useState, useEffect, lazy, Suspense } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import WhatsAppButton from "../../components/WhatsAppButton";
import { trackFacebookEvent } from "../../utils/facebookTracking";

import Testimonials from "./sections/Testimonials/Testimonials";
import Footer from "./sections/Footer/Footer";
import StickyMobileOrderBar from "../../components/StickyMobileOrderBar";

const PromotionPopup = lazy(() => import("./sections/Hero/PromotionPopup"));

export const Home = () => {
  const [showPromo, setShowPromo] = useState(false);

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
        value: 1400,
        currency: "BDT"
      }, cachedUserData);
    }, 1400);

    // 3. Show popup ONLY after real user interaction (guards against Lighthouse/bots)
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
          // Do not interrupt customer if they are actively typing or already looking at checkout
          const activeTag = document.activeElement ? document.activeElement.tagName : '';
          const isUserTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
          if (!isUserTyping) {
            setShowPromo(true);
            sessionStorage.setItem("hasShownPromo", "true");
          }
        }, 3000);
      };

      const events = ['scroll', 'touchstart', 'mousemove', 'pointerdown'];
      events.forEach(e => window.addEventListener(e, schedulePromo, { passive: true }));

      return () => {
        clearTimeout(pixelTimer);
        if (promoTimer) clearTimeout(promoTimer);
        events.forEach(e => window.removeEventListener(e, schedulePromo));
      };
    }

    return () => clearTimeout(pixelTimer);
  }, []);

  const claimOffer = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setShowPromo(false);
    window.dispatchEvent(new CustomEvent("set-order-quantity", { detail: 2 }));

    const scrollToOrder = () => {
      const element = document.getElementById("order-form-details") || document.getElementById("order");
      if (element) {
        const navOffset = 90;
        const targetY = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth"
        });
      } else {
        window.location.hash = "#order-form-details";
      }
    };

    // Trigger smooth scroll with guaranteed position
    scrollToOrder();
    setTimeout(scrollToOrder, 80);
    setTimeout(scrollToOrder, 220);
  };

  return (
    <div className="bg-milk-white min-h-screen font-sans selection:bg-accent selection:text-husk">
      <Navbar />
      <main>
        <Hero onOpenPromo={() => setShowPromo(true)} />
        <Testimonials />
      </main>
      <Footer />
      {showPromo && (
        <Suspense fallback={null}>
          <PromotionPopup
            isOpen={showPromo}
            onClose={() => setShowPromo(false)}
            onClaim={claimOffer}
          />
        </Suspense>
      )}
      <StickyMobileOrderBar />
      <WhatsAppButton />
    </div>
  );
};
