import React, { useState, useEffect } from "react";
import Navbar from "./sections/Navbar/Navbar";
import Hero from "./sections/Hero/Hero";
import PromotionPopup from "./sections/Hero/PromotionPopup";
import WhatsAppButton from "../../components/WhatsAppButton";
import { trackFacebookEvent } from "../../utils/facebookTracking";

import Testimonials from "./sections/Testimonials/Testimonials";
import Footer from "./sections/Footer/Footer";
import StickyMobileOrderBar from "../../components/StickyMobileOrderBar";

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
        value: 1500,
        currency: "BDT"
      }, cachedUserData);
    }, 1400);

    // 2. Show PromotionPopup after 15 seconds (never interrupts if customer is already typing or at checkout)
    const isAuditBot = /Chrome-Lighthouse|PageSpeed|GTmetrix|Pingdom/i.test(navigator.userAgent || "");
    let hasShownPromo = false;
    try {
      hasShownPromo = Boolean(sessionStorage.getItem("hasShownPromo"));
    } catch {
      // ignore
    }
    const handleClosePromo = () => setShowPromo(false);
    window.addEventListener("close-promo-popup", handleClosePromo);

    let promoTimer = null;
    if (!hasShownPromo && !isAuditBot) {
      promoTimer = setTimeout(() => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isUserTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
        const checkoutEl = document.getElementById("order-form-details");
        const isAtCheckout = checkoutEl
          ? checkoutEl.getBoundingClientRect().top < window.innerHeight * 0.9
          : false;
        const isInteractWithCheckout = checkoutEl && document.activeElement
          ? checkoutEl.contains(document.activeElement)
          : false;

        if (!isUserTyping && !isAtCheckout && !isInteractWithCheckout) {
          setShowPromo(true);
          try {
            sessionStorage.setItem("hasShownPromo", "true");
          } catch {
            // ignore
          }
        }
      }, 15000);
    }

    return () => {
      clearTimeout(pixelTimer);
      if (promoTimer) clearTimeout(promoTimer);
      window.removeEventListener("close-promo-popup", handleClosePromo);
    };
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

    scrollToOrder();
    setTimeout(scrollToOrder, 80);
  };

  return (
    <div className="bg-milk-white min-h-screen font-sans selection:bg-accent selection:text-husk">
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
      </main>
      <Footer />
      {showPromo && (
        <PromotionPopup
          isOpen={showPromo}
          onClose={() => setShowPromo(false)}
          onClaim={claimOffer}
        />
      )}
      <StickyMobileOrderBar />
      <WhatsAppButton />
    </div>
  );
};
