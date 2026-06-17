import React, { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

const OrderSuccessPopup = ({ isOpen, onClose, customerName }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimated(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#161a14]/80 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimated ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] z-10 text-center transition-all duration-300 transform ${
          isAnimated ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-husk/50 hover:text-husk transition-colors z-20"
          aria-label="Close success dialog"
        >
          <X size={18} />
        </button>

        {/* Success Illustration */}
        <div className="bg-primary/5 pt-10 pb-6 px-8 flex justify-center">
          <div
            className={`bg-primary/10 p-4 rounded-full relative transition-transform duration-500 delay-100 transform ${
              isAnimated ? "scale-100" : "scale-0"
            }`}
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <CheckCircle2 size={64} className="text-primary relative z-10" />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 pt-4">
          <h3 className="text-2xl font-black text-husk mb-2">Order Confirmed!</h3>
          <p className="text-sm text-husk/70 leading-relaxed font-medium mb-6">
            Thank you <span className="font-bold text-primary">{customerName || "Customer"}</span>! 
            Your order has been received successfully. We will process it shortly.
            <br />
            <span className="block mt-2 text-primary font-bold text-xs sm:text-sm">
              আপনার ডেলিভারি ডেট আপনাকে আপনার মোবাইলে SMS বা WhatsApp-এ জানিয়ে দেওয়া হবে।
            </span>
          </p>

          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPopup;
