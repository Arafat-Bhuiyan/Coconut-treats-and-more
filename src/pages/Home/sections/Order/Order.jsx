import React, { useState, useEffect } from "react";
import { Send, Minus, Plus, Trash2, CheckCircle, Loader2, MapPin } from "lucide-react";
const productImg = "/hero.webp";
import OrderSuccessPopup from "./OrderSuccessPopup";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";
import CountdownTimer from "../../../../components/CountdownTimer";

const Order = ({ quantity, setQuantity }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    house: "",
    road: "",
    area: "",
    flat: "",
    note: "",
    agree: true
  });

  const basePrice = 600;
  const offerPrice = 540;
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

    // Custom Validation with focus & smooth scroll-into-view
    if (!formData.name.trim()) {
      alert("দয়া করে আপনার নাম লিখুন। (Please fill in Your Name)");
      const nameInput = document.getElementsByName("name")[0];
      if (nameInput) {
        nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInput.focus();
      }
      return;
    }

    if (!formData.phone.trim()) {
      alert("দয়া করে আপনার মোবাইল নাম্বার লিখুন। (Please fill in Your Mobile Number)");
      const phoneInput = document.getElementsByName("phone")[0];
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    if (!formData.area.trim()) {
      alert("দয়া করে আপনার এলাকার নাম লিখুন। (Please fill in Your Area Name)");
      const areaInput = document.getElementsByName("area")[0];
      if (areaInput) {
        areaInput.scrollIntoView({ behavior: "smooth", block: "center" });
        areaInput.focus();
      }
      return;
    }

    if (!formData.agree) {
      alert("অর্ডার করতে শর্তাবলীতে সম্মতি দেওয়া আবশ্যক। (You must agree to the Terms to place an order.)");
      const termsCheckbox = document.getElementById("terms");
      if (termsCheckbox) {
        termsCheckbox.scrollIntoView({ behavior: "smooth", block: "center" });
        termsCheckbox.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const addressParts = [];
    if (formData.flat.trim()) addressParts.push(`Flat/Floor: ${formData.flat.trim()}`);
    if (formData.house.trim()) addressParts.push(`House: ${formData.house.trim()}`);
    if (formData.road.trim()) addressParts.push(`Road: ${formData.road.trim()}`);
    if (formData.area.trim()) addressParts.push(`Area: ${formData.area.trim()}`);
    addressParts.push("Dhaka");
    const fullAddress = addressParts.join(", ");

    const emailPayload = {
      subject: "New Order from Website",
      from_name: formData.name,
      Customer: formData.name,
      Phone: formData.phone,
      Address: fullAddress,
      Note: formData.note || "N/A",
      Product: "Premium Coconut Pudding (6pc Box)",
      Quantity: `${quantity} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Total_Amount: `৳${totalOrderAmount}`
    };
    
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });

      const result = await response.json().catch(() => ({ success: false }));

      if (response.ok && result.success) {
        // High-deduplication Hybrid Purchase Tracking (Browser + Server-side)
        trackFacebookEvent("Purchase", {
          value: totalOrderAmount,
          currency: "BDT",
          content_name: "Premium Coconut Pudding (6pc Box)",
          content_ids: ["coconut-pudding-6pc"],
          contents: [{ id: "coconut-pudding-6pc", quantity: quantity, item_price: basePrice }],
          content_type: "product",
          num_items: quantity,
        }, {
          phone: formData.phone,
          name: formData.name,
          address: fullAddress,
        });

        setSubmittedName(formData.name);
        setShowSuccess(true);
        // Reset form
        setFormData({
          name: "",
          phone: "",
          house: "",
          road: "",
          area: "",
          flat: "",
          note: "",
          agree: true
        });
        setQuantity(1);
      } else {
        const errorMsg = result.message || "Failed to submit order. Please try again or contact us directly.";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Something went wrong. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 overflow-hidden relative">
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

      {/* Premium Quality Quote Badge */}
      <div className="flex justify-center mb-5 sm:mb-6 px-4">
        <div
          className="bg-white/70 backdrop-blur-xl border border-primary/20 w-[300px] sm:w-[380px] h-[58px] sm:h-[66px] rounded-[2rem] text-center flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(74,103,65,0.06)] overflow-hidden relative"
        >
          <p
            className={`text-sm sm:text-base font-black text-primary leading-normal transition-all duration-500 transform ${
              quoteIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none absolute"
            }`}
          >
            "জিনিস যেটা ভালো, দাম তার একটু বেশি"
          </p>
          <p
            className={`text-sm sm:text-base font-black text-primary leading-normal transition-all duration-500 transform ${
              quoteIndex === 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none absolute"
            }`}
          >
            "Good quality always costs a bit more."
          </p>
        </div>
      </div>

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
          <div
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-50/90 backdrop-blur-sm border-2 border-primary rounded-full text-primary font-extrabold text-sm sm:text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <MapPin size={18} className="text-primary animate-bounce" />
            <span>শুধুমাত্র ঢাকা সিটির ভিতরে ডেলিভারি করা হয়</span>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-8 sm:gap-12 items-start">
          {/* Left Side: Form */}
          <div
            className="lg:col-span-3 glass-panel p-6 sm:p-8 md:p-10 rounded-[2rem]"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-husk mb-6 sm:mb-8 text-center lg:text-left">
              Place Your Order
            </h3>

            <form onSubmit={handleOrder} noValidate className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    required
                    name="name"
                    autoComplete="name"
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
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel"
                    placeholder="01XXX-XXXXXX"
                    className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm sm:text-base placeholder:text-husk/30"
                  />
                </div>
              </div>

              {/* Delivery Address Group Container */}
              <div className="bg-white border-2 border-primary/20 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-7 space-y-5">
                <p className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest border-b-2 border-primary/10 pb-3 mb-2 flex items-center gap-2">
                  <span>📍</span> Delivery Address / ডেলিভারি ঠিকানা
                </p>

                <div className="space-y-3 sm:space-y-4">
                  {/* Area Name / এলাকা */}
                  <div className="flex flex-row items-center gap-2 sm:gap-4 py-1">
                    <label className="text-xs sm:text-base font-bold text-husk whitespace-nowrap min-w-[135px] sm:min-w-[190px]">
                      Area Name / এলাকা :
                    </label>
                    <input
                      required
                      name="area"
                      autoComplete="address-level2"
                      value={formData.area}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g. Dhanmondi, Gulshan, Mirpur"
                      className="flex-1 bg-transparent border-0 p-0 outline-none text-xs sm:text-base text-husk font-medium placeholder:text-husk/30 focus:ring-0"
                    />
                  </div>

                  {/* Road No / Name / রাস্তা */}
                  <div className="flex flex-row items-center gap-2 sm:gap-4 py-1">
                    <label className="text-xs sm:text-base font-bold text-husk whitespace-nowrap min-w-[135px] sm:min-w-[190px]">
                      Road No / Name / রাস্তা :
                    </label>
                    <input
                      name="road"
                      autoComplete="address-line2"
                      value={formData.road}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g. Road 12A, Lane 2"
                      className="flex-1 bg-transparent border-0 p-0 outline-none text-xs sm:text-base text-husk font-medium placeholder:text-husk/30 focus:ring-0"
                    />
                  </div>

                  {/* House No / Name / বাড়ি */}
                  <div className="flex flex-row items-center gap-2 sm:gap-4 py-1">
                    <label className="text-xs sm:text-base font-bold text-husk whitespace-nowrap min-w-[135px] sm:min-w-[190px]">
                      House No / Name / বাড়ি :
                    </label>
                    <input
                      name="house"
                      autoComplete="address-line1"
                      value={formData.house}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g. House 45, Holding 12"
                      className="flex-1 bg-transparent border-0 p-0 outline-none text-xs sm:text-base text-husk font-medium placeholder:text-husk/30 focus:ring-0"
                    />
                  </div>

                  {/* Flat / Floor No / ফ্ল্যাট */}
                  <div className="flex flex-row items-center gap-2 sm:gap-4 py-1">
                    <label className="text-xs sm:text-base font-bold text-husk whitespace-nowrap min-w-[135px] sm:min-w-[190px]">
                      Flat / Floor No / ফ্ল্যাট :
                    </label>
                    <input
                      name="flat"
                      autoComplete="address-line3"
                      value={formData.flat}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g. Flat 3B, 4th Floor (Write N/A if none)"
                      className="flex-1 bg-transparent border-0 p-0 outline-none text-xs sm:text-base text-husk font-medium placeholder:text-husk/30 focus:ring-0"
                    />
                  </div>
                </div>
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
                  className="text-xs sm:text-sm font-bold text-husk/85 cursor-pointer select-none leading-snug"
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

              {/* Offer Badge - Moved below Confirm Order */}
              <div className="relative glass-card rounded-[2rem] w-full overflow-hidden transition-all duration-300 group transform hover:-translate-y-1 mt-6">
                
                {/* Top Green Gradient Bar */}
                <div className="bg-gradient-to-r from-primary via-primary-dark to-primary h-2 w-full" />

                <div className="p-5 sm:p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="font-black text-husk text-xl sm:text-2xl leading-tight tracking-tight">
                        Buy More, Save More!
                      </div>
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
                        Price drops to ৳540 per box automatically! ✨
                      </p>
                    </div>
                  </div>

                  {/* Bottom Savings Banner */}
                  <div className="rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4A6741 0%, #5A7336 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 6px 20px rgba(74, 103, 65, 0.35), inset 0 1px 0 rgba(255,255,255,0.45)'}}>
                    <span className="absolute inset-0 rounded-xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)', pointerEvents: 'none'}} />
                    <div className="flex items-center gap-1.5 relative z-10">
                      <span className="text-xl">🎁</span>
                      <span className="text-base sm:text-lg font-black leading-tight text-white" style={{textShadow: '0 1.5px 3px rgba(0,0,0,0.4)'}}>
                        Instant Discount
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-black relative z-10 text-center text-white" style={{textShadow: '0 1.5px 3px rgba(0,0,0,0.4)'}}>
                      Total ৳120 Save on 2 boxes! 🎉
                    </span>
                  </div>

                  {/* Countdown Timer */}
                  <div className="mt-3.5 pt-3 border-t border-dashed border-gray-150 flex items-center justify-center w-full">
                    <CountdownTimer />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side: Summary */}
          <div
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
                  <div className="font-bold text-husk text-xs sm:text-sm leading-tight">
                    Premium Coconut Pudding (6pc Box)
                  </div>
                  <p className="text-xs font-black text-primary mt-1">৳{unitPrice} / box</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center bg-slate-50 rounded-lg p-1 border">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                      className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary active:scale-95"
                      aria-label="Decrease quantity"
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
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-black text-husk text-sm">৳{totalProductPrice}</p>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="space-y-4 pt-6">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase">
                  <span>Subtotal</span>
                  <span>৳{quantity * basePrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase">
                  <span>Delivery Charge</span>
                  <span>৳{deliveryCharge}</span>
                </div>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    quantity >= 2 
                      ? "max-h-[100px] opacity-100 mt-2" 
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="bg-accent/10 p-3 rounded-xl border border-accent/20 flex items-center justify-between">
                    <span className="text-[10px] font-black text-accent-dark uppercase flex items-center gap-2 tracking-widest">
                      <CheckCircle size={12} /> BULK OFFER
                    </span>
                    <span className="text-xs font-black text-accent-dark">
                      - ৳{quantity * (basePrice - offerPrice)} Saved
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-black text-husk pt-4 border-t border-dashed">
                  <span className="uppercase text-sm">Total</span>
                  <span className="text-primary text-2xl">৳{totalOrderAmount}</span>
                </div>
              </div>
            </div>


          </div>
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
