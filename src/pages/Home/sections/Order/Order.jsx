import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Minus, Plus, Trash2, CheckCircle, Loader2, MapPin } from "lucide-react";
import productImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";
import OrderSuccessPopup from "./OrderSuccessPopup";

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
  const offerPrice = 540;
  const deliveryCharge = 80;

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
        // Facebook Pixel Purchase Tracking (Only fire when order is successful)
        if (window.fbq) {
          window.fbq('track', 'Purchase', {
            value: totalOrderAmount,
            currency: 'BDT',
            content_name: 'Premium Coconut Pudding (6pc Box)',
            content_type: 'product',
            num_items: quantity,
          });
        }

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
    <section id="order" className="py-16 sm:py-24 px-4 bg-[#f8fafc] overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Dhaka City Delivery Notification Pop up (Red Pill/Circle) */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-50/90 backdrop-blur-sm border-2 border-red-500 rounded-full text-red-600 font-extrabold text-sm sm:text-base shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <MapPin size={18} className="text-red-500 animate-bounce" />
            <span>শুধুমাত্র ঢাকা সিটির ভিতরে ডেলিভারি করা হয়</span>
          </motion.div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-8 sm:gap-12 items-start">
          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-xl shadow-secondary/5 border border-secondary/5"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm sm:text-base"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm sm:text-base"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none shadow-inner text-sm sm:text-base"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none shadow-inner text-sm sm:text-base"
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
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-secondary/5">
              <h3 className="text-xl font-black text-husk mb-6 border-b pb-4 text-center lg:text-left">
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
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 sm:w-8 text-center font-black text-sm text-husk">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary"
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
                  <span>Delivery</span>
                  <span>৳{deliveryCharge}</span>
                </div>

                {quantity >= 2 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-accent/10 p-3 rounded-xl border border-accent/20 flex items-center justify-between"
                  >
                    <span className="text-[10px] font-black text-accent-dark uppercase flex items-center gap-2 tracking-widest">
                      <CheckCircle size={12} /> BULK OFFER
                    </span>
                    <span className="text-xs font-black text-accent-dark">
                      - ৳{quantity * 60} Saved
                    </span>
                  </motion.div>
                )}

                <div className="flex justify-between text-xl font-black text-husk pt-4 border-t border-dashed">
                  <span className="uppercase text-sm">Total</span>
                  <span className="text-primary text-2xl">৳{totalOrderAmount}</span>
                </div>
              </div>
            </div>

            {/* Offer Badge */}
            <div className="flex bg-gradient-to-br from-white/95 via-white/80 to-accent/20 backdrop-blur-xl border-2 border-white/90 p-5 sm:p-6 rounded-[2rem] text-husk shadow-[0_20px_50px_rgba(74,103,65,0.12)] hover:shadow-[0_25px_60px_rgba(151,188,98,0.28)] transition-all duration-300 items-center gap-4 border border-secondary/10 w-full relative overflow-hidden group">
              {/* Decorative Glass Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10 group-hover:bg-accent/30 transition-colors duration-500" />
              
              {/* Glowing Icon Badge */}
              <div className="bg-primary/10 p-3 sm:p-4 rounded-2xl border border-primary/15 flex-shrink-0 flex items-center justify-center shadow-inner relative overflow-hidden">
                <span className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <CheckCircle className="text-primary animate-pulse" size={26} />
              </div>
              
              <div className="space-y-1.5 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-black text-husk text-base sm:text-lg leading-tight tracking-tight">
                    Buy More, Save More!
                  </h4>
                  <span className="bg-[#FEF9C3] text-amber-800 border border-amber-300/50 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                    🔥 ACTIVE DEAL
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-husk/80 leading-relaxed font-bold">
                  Order{" "}<span className="bg-primary text-white font-black px-2 py-0.5 rounded-lg shadow-sm whitespace-nowrap">2 or more boxes</span>{" "}to unlock the{" "}<span className="bg-accent text-husk font-black px-2 py-0.5 rounded-lg shadow-sm whitespace-nowrap border border-accent/30">৳540/box</span>{" "}offer.
                </p>
                
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 bg-accent/30 border border-accent/20 px-2.5 py-1 rounded-xl shadow-sm">
                    ✨ You're saving ৳60 per box!
                  </span>
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
