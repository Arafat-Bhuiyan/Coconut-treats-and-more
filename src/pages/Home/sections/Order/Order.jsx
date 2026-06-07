import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Minus, Plus, Trash2, CheckCircle, Loader2, MapPin } from "lucide-react";
import productImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import OrderSuccessPopup from "./OrderSuccessPopup";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";

const Order = ({ quantity, setQuantity }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    agree: true
  });

  const basePrice = 600;
  const offerPrice = 570;
  const deliveryCharge = 100;

  const unitPrice = quantity >= 2 ? offerPrice : basePrice;
  const totalProductPrice = quantity * unitPrice;
  const totalOrderAmount = totalProductPrice + deliveryCharge;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const deliveryLocations = [
    "Baily Road, Dhaka", "Banani DOHS", "Banani, Dhaka", "Baridhara DOHS", 
    "Baridhara, Dhaka", "Mohakhali DOHS", "Mirpur DOHS", "Gulshan 1", "Gulshan 2", 
    "Gulshan Avenue", "Gulshan, Dhaka, Bangladesh", "Niketan R/A, Gulshan, Dhaka", 
    "Bashundhara R/A", "Bashundhara Shopping Mall", "Dhanmondi, Dhaka", 
    "Lalmatia / লালমাটিয়া", "Mohammadpur, Dhaka 1207", "Elephant Road, Dhaka", 
    "Eskaton, Dhaka", "Uttara, Dhaka", "Diabari Uttara - দিয়াবাড়ি উত্তরা", 
    "Wari, Dhaka", "Khilgaon, Dhaka", "Banasree, Dhaka, Bangladesh", 
    "Aftabnagar, Dhaka", "Rampura, Dhaka", "Motijheel, Dhaka-1000", 
    "Dhaka Cantonment", "Mirpur-1, Dhaka", "Mirpur-11.5, Pallabi", 
    "Mirpur-12, Pallabi", "Mirpur Pallabi"
  ];

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in Name, Phone, and Address");
      return;
    }

    setIsSubmitting(true);

    const emailPayload = {
      access_key: "d8812e1d-78ce-4959-8fe1-4430144dd80d",
      subject: "New Order from Website",
      from_name: formData.name,
      Customer: formData.name,
      Phone: formData.phone,
      Address: formData.address,
      Note: formData.note || "N/A",
      Product: "Premium Coconut Pudding (6pc Box)",
      Quantity: `${quantity} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Total_Amount: `৳${totalOrderAmount}`
    };
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });

      if (response.ok) {
        // High-deduplication Hybrid Purchase Tracking (Browser + Server-side)
        trackFacebookEvent("Purchase", {
          value: totalOrderAmount,
          currency: "BDT",
          content_name: "Premium Coconut Pudding (6pc Box)",
          content_type: "product",
          num_items: quantity,
        }, {
          phone: formData.phone,
          name: formData.name
        });

        setSubmittedName(formData.name);
        setShowSuccess(true);
        // Reset form
        setFormData({
          name: "",
          phone: "",
          address: "",
          note: "",
          agree: true
        });
        setQuantity(1);
      } else {
        alert("Failed to submit order. Please try again or contact us directly.");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Something went wrong. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="py-16 sm:py-24 px-4 overflow-hidden relative">
      <style>
        {`
          @keyframes scrollText {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .scrolling-wrapper {
            display: flex;
            white-space: nowrap;
            overflow: hidden;
            width: 100%;
          }
          .scrolling-text {
            display: flex;
            animation: scrollText 150s linear infinite;
          }
          .scrolling-wrapper:hover .scrolling-text {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* Scrolling Delivery Locations Marquee */}
      <div className="relative w-full bg-primary/5 backdrop-blur-md border-y border-white/60 shadow-[0_4px_30px_rgba(74,103,65,0.05)] py-2 mb-8 sm:mb-10 overflow-hidden">
        <div className="scrolling-wrapper [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="scrolling-text">
            {[...deliveryLocations, ...deliveryLocations].map((loc, index) => (
              <div key={index} className="flex items-center mx-3 sm:mx-5 hover:scale-105 transition-transform duration-300">
                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest whitespace-nowrap flex items-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary mr-2 animate-pulse shadow-sm"></span> {loc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Dhaka City Delivery Notification Pop up (Green Flashing Pill/Circle) */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-50/90 backdrop-blur-sm border-2 border-primary rounded-full text-primary font-extrabold text-sm sm:text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <MapPin size={18} className="text-primary animate-bounce" />
            <span>শুধুমাত্র ঢাকা সিটির ভিতরে ডেলিভারি করা হয়</span>
          </motion.div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-8 sm:gap-12 items-start">
          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass-panel p-6 sm:p-8 md:p-10 rounded-[2rem]"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-husk mb-6 sm:mb-8 text-center lg:text-left">
              Place Your Order
            </h3>

            <form onSubmit={handleOrder} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm sm:text-base placeholder:text-husk/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel"
                    placeholder="01XXX-XXXXXX"
                    className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm sm:text-base placeholder:text-husk/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                  Full Address
                </label>
                <textarea
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="House, Road, Area, Dhaka"
                  className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none text-sm sm:text-base placeholder:text-husk/30"
                ></textarea>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-primary/5 p-4 rounded-xl sm:rounded-2xl border border-primary/10 flex flex-col justify-center">
                    <p className="text-sm font-black text-primary uppercase tracking-widest mb-1.5">
                      Option 1: bKash
                    </p>
                    <p className="text-base sm:text-base text-husk font-bold leading-relaxed">
                      Send money to <span className="text-primary font-black">+8801618562844</span>.
                      Write{" "}
                      <span className="underline decoration-primary/30 underline-offset-2">
                        TrxID
                      </span>{" "}
                      in note.
                    </p>
                  </div>

                  <div className="bg-accent/10 p-4 rounded-xl sm:rounded-2xl border border-accent/20 flex flex-col justify-center">
                    <p className="text-sm font-black text-accent-dark uppercase tracking-widest mb-1.5">
                      Option 2: COD
                    </p>
                    <p className="text-base sm:text-base text-husk font-bold leading-relaxed">
                      Prefer COD? Write{" "}
                      <span className="text-accent-dark font-black">"Cash on Delivery"</span> in the
                      note.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Order Note
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="TrxID, Number, or Special Instructions..."
                    className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none text-sm sm:text-base placeholder:text-husk/30"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-start gap-3 p-1">
                <input
                  type="checkbox"
                  id="terms"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-0.5 accent-primary rounded cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs sm:text-sm font-bold text-husk/60 cursor-pointer select-none leading-snug"
                >
                  I confirm that my information is correct and I agree to the{" "}
                  <span className="text-primary underline">Terms</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black text-lg py-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/30 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    PROCESSING...
                  </>
                ) : (
                  "CONFIRM ORDER"
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Side: Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-panel p-6 sm:p-8 rounded-[2rem]">
              <h3 className="text-xl font-black text-husk mb-6 border-b border-primary/10 pb-4 text-center lg:text-left">
                Order Summary
              </h3>

              {/* Product Info Row */}
              <div className="flex gap-4 items-center pb-6 border-b border-dashed">
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border">
                  <img src={productImg} alt="Product" className="w-full h-full object-cover" loading="lazy" width={80} height={80} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-husk text-xs sm:text-sm leading-tight">
                    Premium Coconut Pudding (6pc Box)
                  </h4>
                  <p className="text-xs font-black text-primary mt-1">৳{unitPrice} / box</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center bg-slate-50 rounded-lg p-1 border">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                      className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary active:scale-95"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 sm:w-8 text-center font-black text-sm text-husk select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQuantity(quantity + 1); }}
                      className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-black text-husk text-sm">৳{totalProductPrice}</p>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="space-y-4 pt-6">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/60 uppercase">
                  <span>Subtotal</span>
                  <span>৳{totalProductPrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/60 uppercase">
                  <span>Delivery Charge</span>
                  <span>৳{deliveryCharge}</span>
                </div>

                <AnimatePresence>
                {quantity >= 2 && (
                  <motion.div
                    key="bulk-offer"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="bg-accent/10 p-3 rounded-xl border border-accent/20 flex items-center justify-between">
                      <span className="text-[10px] font-black text-accent-dark uppercase flex items-center gap-2 tracking-widest">
                        <CheckCircle size={12} /> BULK OFFER
                      </span>
                      <span className="text-xs font-black text-accent-dark">
                        - ৳{quantity * 30} Saved
                      </span>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                <div className="flex justify-between text-xl font-black text-husk pt-4 border-t border-dashed">
                  <span className="uppercase text-sm">Total</span>
                  <span className="text-primary text-2xl">৳{totalOrderAmount}</span>
                </div>
              </div>
            </div>

            {/* Offer Badge - Premium Redesign */}
            <div className="relative glass-card rounded-[2rem] w-full overflow-hidden transition-all duration-300 group transform hover:-translate-y-1">
              
              {/* Top Green Gradient Bar */}
              <div className="bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

              <div className="p-5 sm:p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-black text-husk text-xl sm:text-2xl leading-tight tracking-tight">
                      Buy More, Save More!
                    </h4>
                    <p className="text-xs text-husk/50 font-bold mt-0.5">Special bulk discount offer</p>
                  </div>
                  <span className="flex-shrink-0 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                    🔥 ACTIVE DEAL
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-dashed border-gray-100 mb-4" />

                {/* Info Rows */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-base flex-shrink-0">📦</span>
                    <p className="text-xs sm:text-sm text-husk font-black">
                      Order 2 or more boxes to unlock 💰
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-base flex-shrink-0">💰</span>
                    <p className="text-xs sm:text-sm text-husk font-black">
                      Price drops to ৳570 per box automatically! ✨
                    </p>
                  </div>
                </div>

                {/* Bottom Savings Banner */}
                <div className="bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                  <span className="text-xl">🎁</span>
                  <span className="text-sm sm:text-base font-black text-husk">Total ৳60 Discount on 2 boxes!</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <OrderSuccessPopup 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        customerName={submittedName} 
      />
    </section>
  );
};

export default Order;
