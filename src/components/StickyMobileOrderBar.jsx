import React, { useState, useEffect } from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";

const StickyMobileOrderBar = ({ initialPkg = 2, initialTotal = "৳1,500" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pkg, setPkg] = useState(initialPkg);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const handleInfo = (e) => {
      if (e.detail) {
        if (e.detail.selectedPkg) setPkg(e.detail.selectedPkg);
        if (e.detail.grandTotal) setTotal(e.detail.grandTotal);
      }
    };
    window.addEventListener("sticky-order-info", handleInfo);
    return () => window.removeEventListener("sticky-order-info", handleInfo);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const orderSection = document.getElementById("order");
      if (!orderSection) return;

      const orderRect = orderSection.getBoundingClientRect();
      // Show sticky bar ONLY when user has scrolled past the main order card
      const isPastOrder = orderRect.bottom < 100;
      setIsVisible(isPastOrder);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToForm = () => {
    const formSection = document.getElementById("order-form-details");
    if (formSection) {
      const navOffset = 90;
      const targetY = formSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      setTimeout(() => {
        const phoneInput = document.getElementById("customer-phone");
        if (phoneInput) phoneInput.focus();
      }, 400);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t-2 border-[#4A6741]/25 px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-[#4A6741]/25 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
            🥥
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#1F291E]">
                {pkg} Box{pkg > 1 ? "es" : ""} ({pkg * 6} Cups)
              </span>
            </div>
            <span className="text-sm font-black text-[#4A6741] block leading-none mt-0.5">
              {total} <span className="text-[10px] text-gray-500 font-bold">মোট</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScrollToForm}
          style={{ touchAction: 'manipulation' }}
          className="flex-shrink-0 bg-gradient-to-r from-[#4A6741] to-[#364d2f] hover:brightness-110 active:scale-95 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#4A6741]/30 cursor-pointer select-none"
        >
          <ShoppingBag size={14} />
          <span>অর্ডার করুন</span>
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default StickyMobileOrderBar;
