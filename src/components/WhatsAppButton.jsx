import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show button after a short delay for a smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = "8801618562844"; // +8801618562844
  const message = encodeURIComponent("হ্যালো! আমি Coconut Treats & More সম্পর্কে জানতে চাই।");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div
      className="fixed right-6 z-50 flex flex-col items-end gap-3 transition-all duration-500 pointer-events-none"
      style={{
        top: "50%",
        transform: visible ? "translateY(-50%) scale(1)" : "translateY(-40%) scale(0.75)",
        opacity: visible ? 1 : 0
      }}
    >
      {/* Tooltip / Chat Bubble */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl p-4 max-w-[230px] border border-gray-100 transition-all duration-300 transform origin-bottom-right pointer-events-auto ${
          showTooltip
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setShowTooltip(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close chat invitation"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pr-4">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.122.554 4.11 1.522 5.837L.057 23.625a.75.75 0 0 0 .918.919l5.688-1.479A11.944 11.944 0 0 0 12 24c6.626 0 12-5.374 12-12S18.626 0 12 0zm0 22c-1.885 0-3.645-.493-5.175-1.355l-.37-.22-3.827.995.999-3.742-.242-.386A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">Coconut Treats</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#25D366] rounded-full inline-block"></span>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-[#f0fdf4] rounded-xl rounded-tl-none p-3 mb-3">
          <p className="text-sm text-gray-700 leading-relaxed font-semibold">
            👋 হ্যালো! অর্ডার বা যেকোনো প্রশ্নের জন্য আমাকে মেসেজ করুন।
          </p>
          <p className="text-xs text-gray-400 text-right mt-1">Just now</p>
        </div>

        {/* CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-center font-bold text-sm py-2.5 rounded-xl transition-all"
        >
          Start Chat →
        </a>

        {/* Arrow pointing to button */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
      </div>

      {/* Main WhatsApp Button */}
      <button
        type="button"
        onClick={() => setShowTooltip((prev) => !prev)}
        style={{ touchAction: 'manipulation' }}
        className="relative w-16 h-16 bg-[#25D366] hover:bg-[#1ebe5d] rounded-full shadow-2xl shadow-[#25D366]/40 flex items-center justify-center transition-all cursor-pointer select-none pointer-events-auto"
        aria-label="Chat on WhatsApp"
      >
        {/* Ping animation ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25"></span>

        {/* WhatsApp Icon */}
        <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.374 0 0 5.373 0 12c0 2.122.554 4.11 1.522 5.837L.057 23.625a.75.75 0 0 0 .918.919l5.688-1.479A11.944 11.944 0 0 0 12 24c6.626 0 12-5.374 12-12S18.626 0 12 0zm0 22c-1.885 0-3.645-.493-5.175-1.355l-.37-.22-3.827.995.999-3.742-.242-.386A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </button>
    </div>
  );
};

export default WhatsAppButton;
