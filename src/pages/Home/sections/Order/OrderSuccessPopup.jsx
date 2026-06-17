import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

const OrderSuccessPopup = ({ isOpen, onClose, customerName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#161a14]/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] z-10 text-center"
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="bg-primary/10 p-4 rounded-full relative"
              >
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <CheckCircle2 size={64} className="text-primary relative z-10" />
              </motion.div>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSuccessPopup;
