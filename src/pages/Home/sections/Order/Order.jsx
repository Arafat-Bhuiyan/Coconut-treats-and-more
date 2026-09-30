import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, Loader2, MapPin, Copy, Check, ShieldCheck, Lock, Smartphone, Banknote, Truck } from "lucide-react";
import OrderSuccessPopup from "./OrderSuccessPopup";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";
import CountdownTimer from "../../../../components/CountdownTimer";

const productImg = "/pudding-3d.webp";
const productImgFallback = "/pudding-3d.jpg";

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

const Order = () => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [formError, setFormError] = useState("");
  const submittingRef = useRef(false); // Ref guard to prevent double-submission

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSetQuantity = (e) => {
      if (e.detail) {
        setQuantity(e.detail);
      }
    };
    window.addEventListener("set-order-quantity", handleSetQuantity);
    return () => window.removeEventListener("set-order-quantity", handleSetQuantity);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    agree: true
  });

  const basePrice = 750;
  const offerPrice = 700;
  const isFreeDelivery = quantity >= 5;
  const deliveryCharge = isFreeDelivery ? 0 : 100;

  let unitPrice = basePrice;
  if (quantity >= 5) {
    unitPrice = 680; // 5 * 680 = 3,400 (Save ৳350 + Free Delivery)
  } else if (quantity >= 2) {
    unitPrice = offerPrice; // 2 * 700 = 1,400 (Save ৳100)
  }

  const totalProductPrice = quantity * unitPrice;
  const totalOrderAmount = totalProductPrice + deliveryCharge;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "bkash"
  const [bkashTrx, setBkashTrx] = useState("");
  const [copiedBkash, setCopiedBkash] = useState(false);

  const handleCopyBkash = () => {
    const bkashNum = "01618562844";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(bkashNum).catch(() => {});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = bkashNum;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopiedBkash(true);
    setTimeout(() => setCopiedBkash(false), 2200);
  };

  const handleOrder = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Guard: prevent double-firing from onClick + onSubmit conflict on mobile
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Custom Validation with smooth scroll-into-view
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      submittingRef.current = false; // Release guard so button works again
      setFormError("দয়া করে আপনার মোবাইল নাম্বার লিখুন।");
      const phoneInput = document.getElementsByName("phone")[0];
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    // Convert Bengali digits (০-৯) to standard English digits (0-9)
    const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const normalizedPhone = trimmedPhone.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
    const phoneClean = normalizedPhone.replace(/[^0-9]/g, '');
    let standardPhone = phoneClean.startsWith('880') ? '0' + phoneClean.slice(3) : phoneClean;
    if (standardPhone.length === 10 && standardPhone.startsWith('1')) {
      standardPhone = '0' + standardPhone; // Handle omitted leading zero (e.g. 17XXXXXXXX -> 017XXXXXXXX)
    }
    const isValidBDPhone = standardPhone.length === 11 && standardPhone.startsWith('01');

    if (!isValidBDPhone) {
      submittingRef.current = false; // Release guard so button works again
      setFormError("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: 01XXXXXXXXX)।");
      const phoneInput = document.getElementsByName("phone")[0];
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    // Optional Email Validation (if provided, must be valid format)
    const trimmedEmail = formData.email ? formData.email.trim() : "";
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        submittingRef.current = false; // Release guard so button works again
        setFormError("দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন অথবা বক্সটি খালি রাখুন।");
        const emailInput = document.getElementsByName("email")[0];
        if (emailInput) {
          emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
          emailInput.focus();
        }
        return;
      }
    }

    if (!formData.address.trim()) {
      submittingRef.current = false; // Release guard so button works again
      setFormError("দয়া করে আপনার সম্পূর্ণ ঠিকানা লিখুন।");
      const addressInput = document.getElementsByName("address")[0];
      if (addressInput) {
        addressInput.scrollIntoView({ behavior: "smooth", block: "center" });
        addressInput.focus();
      }
      return;
    }

    if (!formData.agree) {
      submittingRef.current = false; // Release guard so button works again
      setFormError("অর্ডার করতে শর্তাবলীতে সম্মতি দেওয়া আবশ্যক।");
      const termsCheckbox = document.getElementById("terms");
      if (termsCheckbox) {
        termsCheckbox.scrollIntoView({ behavior: "smooth", block: "center" });
        termsCheckbox.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const fullAddress = formData.address.trim();
    const customerName = formData.name || "Customer";
    // Capture user data NOW before form resets, so Facebook tracking gets correct values
    const capturedPhone = standardPhone;
    const capturedName = formData.name;
    const capturedEmail = formData.email ? formData.email.trim() : "";

    const formattedPaymentNote = paymentMethod === "cod"
      ? (formData.note.trim() ? `[Cash on Delivery] ${formData.note.trim()}` : "Cash on Delivery")
      : `[bKash] TrxID/No: ${bkashTrx.trim() || "Not provided"}${formData.note.trim() ? ` | ${formData.note.trim()}` : ""}`;

    const emailPayload = {
      subject: "New Order from Website",
      from_name: formData.name || "Grahok",
      Customer: customerName,
      Phone: capturedPhone,
      Email: capturedEmail || "N/A",
      Address: fullAddress,
      Payment_Method: paymentMethod === "cod" ? "Cash on Delivery" : "bKash",
      Note: formattedPaymentNote,
      Product: "Premium Coconut Pudding (6pc Box)",
      Quantity: `${quantity} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Total_Amount: `৳${totalOrderAmount}`
    };

    // 1. Fire Facebook Purchase tracking immediately so tab closure never drops conversion
    trackFacebookEvent("Purchase", {
      value: totalOrderAmount,
      currency: "BDT",
      content_name: "Premium Coconut Pudding (6pc Box)",
      content_ids: ["coconut-pudding-6pc"],
      contents: [{ id: "coconut-pudding-6pc", quantity: quantity, item_price: unitPrice }],
      content_type: "product",
      num_items: quantity,
    }, {
      phone: capturedPhone,
      name: capturedName,
      email: capturedEmail,
      address: fullAddress,
    });

    // 2. Optimistic: show success immediately after a brief snappy animation delay
    setTimeout(() => {
      submittingRef.current = false; // Release guard
      setIsSubmitting(false);
      setSubmittedName(customerName);
      setShowSuccess(true);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        note: "",
        agree: true
      });
      setPaymentMethod("cod");
      setBkashTrx("");
      setQuantity(1);
    }, 350);

    // 3. Send order to backend with keepalive: true so browser never aborts if user navigates away
    fetch("/api/submit-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
      keepalive: true,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          console.error("Order API error:", result);
        }
      })
      .catch((err) => {
        console.error("Order submission error:", err);
      });
  };

  return (
    <section id="order" className="scroll-mt-24 pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 overflow-hidden relative">
      <style>
        {`
          @keyframes badgeBlink {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 0 0 0 rgba(74, 103, 65, 0.4);
            }
            50% {
              opacity: 0.45;
              box-shadow: 0 0 12px 3px rgba(74, 103, 65, 0.25);
            }
          }
          .delivery-blink-badge {
            animation: badgeBlink 1.4s ease-in-out infinite;
          }
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
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-50/90 backdrop-blur-sm border-2 border-primary rounded-full text-primary font-extrabold text-sm sm:text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 text-center"
          >
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <MapPin size={18} className="text-primary animate-bounce flex-shrink-0" />
            <span>ঢাকার সবজায়গায় ডেলিভারি করা হয় (শুধুমাত্র সাভার, আশুলিয়া, যাত্রাবাড়ী, কেরানীগঞ্জ ও ঢাকার বাহিরে ডেলিভারি হয় না)</span>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-8 sm:gap-12 items-start">
          {/* Left Side: Form */}
          <div
            className="lg:col-span-3 glass-panel p-6 sm:p-8 md:p-10 rounded-[2rem]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-husk">
                Place Your Order
              </h3>
              <span className="delivery-blink-badge font-black text-xs sm:text-sm text-primary bg-emerald-50/95 border border-primary/30 px-3.5 py-1.5 rounded-full inline-flex items-center justify-center gap-2 shadow-sm self-center sm:self-auto text-center">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-black tracking-tight">🚚 ঢাকার ভেতরে হোম ডেলিভারি</span>
              </span>
            </div>

            <form onSubmit={handleOrder} noValidate className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="customer-name" className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    id="customer-name"
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
                  <label htmlFor="customer-phone" className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    id="customer-phone"
                    required
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel"
                    placeholder="01XXX-XXXXXX"
                    className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm sm:text-base placeholder:text-husk/30"
                  />
                </div>
              </div>

              {/* Delivery Address Group Container */}
              <div
                onClick={() => document.getElementById('customer-address')?.focus()}
                className="bg-white border-2 border-primary/20 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-7 space-y-5 cursor-text"
              >
                <p className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest border-b-2 border-primary/10 pb-3 mb-2 flex items-center gap-2">
                  <span>📍</span> Delivery Address / ডেলিভারি ঠিকানা
                </p>

                <div className="space-y-1">
                  <label htmlFor="customer-address" className="sr-only">
                    Delivery Address
                  </label>
                  <textarea
                    id="customer-address"
                    required
                    name="address"
                    aria-label="Delivery Address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="আপনার সম্পূর্ণ ঠিকানা (এলাকার নাম, রোড নম্বর, বাড়ি নম্বর, ফ্ল্যাট নম্বর) বিস্তারিত এখানে লিখুন।"
                    className="w-full bg-transparent border-0 p-0 outline-none text-xs sm:text-base text-husk font-medium placeholder:text-husk/60 placeholder:font-bold focus:ring-0 resize-none"
                  />
                  <p className="pt-2 text-xs sm:text-sm font-black text-primary border-t border-primary/10">
                    ⚠️ অবশ্যই ফ্ল্যাট নম্বর দিবেন, যাতে ডেলিভারি দিতে সুবিধা হয়।
                  </p>
                </div>
              </div>

              {/* Email Address Field */}
              <div className="space-y-1">
                <label htmlFor="customer-email" className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address / ইমেইল ঠিকানা</span>
                  <span className="text-[11px] text-husk/40 font-normal normal-case">(ঐচ্ছিক / Optional)</span>
                </label>
                <input
                  id="customer-email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full bg-white border-2 border-secondary/30 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm sm:text-base placeholder:text-husk/30"
                />
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                  Payment Method / মূল্য পরিশোধের মাধ্যম
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Option 1: Cash on Delivery (Default & Recommended) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPaymentMethod("cod")}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentMethod("cod"); }}
                    style={{ touchAction: 'manipulation' }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      paymentMethod === "cod"
                        ? "bg-emerald-50/90 border-primary ring-2 ring-primary/20 shadow-md"
                        : "bg-white border-secondary/20 hover:border-secondary/40 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Banknote size={16} /> Cash on Delivery
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cod" ? "border-primary bg-primary" : "border-gray-300"
                      }`}>
                        {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base font-black text-husk">
                      ক্যাশ অন ডেলিভারি (COD)
                    </p>
                    <p className="text-xs text-husk/70 font-bold mt-1">
                      পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিন।
                    </p>
                  </div>

                  {/* Option 2: bKash (Smart DTC style) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPaymentMethod("bkash")}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentMethod("bkash"); }}
                    style={{ touchAction: 'manipulation' }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      paymentMethod === "bkash"
                        ? "bg-pink-50/90 border-[#D12053] ring-2 ring-[#D12053]/25 shadow-md"
                        : "bg-white border-secondary/20 hover:border-secondary/40 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#D12053] flex items-center gap-1.5">
                        <Smartphone size={16} /> bKash Payment
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "bkash" ? "border-[#D12053] bg-[#D12053]" : "border-gray-300"
                      }`}>
                        {paymentMethod === "bkash" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base font-black text-husk">
                      বিকাশ পেমেন্ট (Send Money)
                    </p>
                    <p className="text-xs text-husk/70 font-bold mt-1">
                      দ্রুত ও নিরাপদ ক্যাশলেস পেমেন্ট।
                    </p>
                  </div>
                </div>

                {/* If bKash selected: Show Ultra-Smart bKash Instruction & 1-Click Copy Card */}
                {paymentMethod === "bkash" && (
                  <div className="bg-gradient-to-br from-pink-50/90 to-rose-50/60 p-4 sm:p-5 rounded-2xl border-2 border-[#D12053]/30 shadow-sm space-y-3.5 animate-fadeIn">
                    
                    {/* bKash Header & Copy Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#D12053]/20">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#D12053] block">
                          bKash Personal Account
                        </span>
                        <span className="text-lg sm:text-xl font-black text-gray-900 tracking-wider">
                          01618562844
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyBkash}
                        style={{ touchAction: 'manipulation' }}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
                          copiedBkash
                            ? "bg-emerald-600 text-white"
                            : "bg-[#D12053] hover:bg-[#b01642] text-white"
                        }`}
                      >
                        {copiedBkash ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>কপি হয়েছে! (Copied)</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>নাম্বার কপি করুন</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Steps */}
                    <div className="bg-white/80 rounded-xl p-3 border border-[#D12053]/15 text-xs text-gray-800 space-y-1.5 font-medium">
                      <p className="font-extrabold text-[#D12053] text-[11px] uppercase tracking-wide">
                        📝 পেমেন্ট নির্দেশিকা (Payment Instructions):
                      </p>
                      <p>1. বিকাশ অ্যাপ বা *247# এ গিয়ে <strong className="text-gray-900">Send Money</strong> সিলেক্ট করুন।</p>
                      <p>2. প্রাপক নম্বর: <strong className="text-[#D12053] font-black">01618562844</strong> (Personal)</p>
                      <p>3. মোট টাকা পাঠান: <strong className="text-gray-900 font-black">৳{totalOrderAmount}</strong> (ক্যাশ আউট খরচ সহ)</p>
                      <p>4. টাকা পাঠানোর পর পাওয়া TrxID বা আপনার বিকাশ নম্বর নিচের ঘরে লিখে অর্ডার সম্পন্ন করুন।</p>
                    </div>

                    {/* TrxID Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="bkash-trx" className="text-xs font-black text-[#D12053] uppercase tracking-wider block">
                        বিকাশ TrxID বা যে নম্বর থেকে পাঠিয়েছেন:
                      </label>
                      <input
                        id="bkash-trx"
                        type="text"
                        value={bkashTrx}
                        onChange={(e) => setBkashTrx(e.target.value)}
                        placeholder="e.g. 9J4K8L2M বা 01XXXXXXXXX"
                        className="w-full bg-white border-2 border-[#D12053]/30 rounded-xl px-4 py-3 outline-none focus:border-[#D12053] focus:ring-2 focus:ring-[#D12053]/20 text-sm font-bold text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="customer-note" className="text-xs sm:text-sm font-bold text-husk/70 ml-1 uppercase tracking-wider">
                    Special Note / বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <textarea
                    id="customer-note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="ডেলিভারি বা প্রোডাক্ট সংক্রান্ত বিশেষ কিছু জানানোর থাকলে লিখুন..."
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

              {formError && (
                <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-pulse">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ touchAction: 'manipulation' }}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black text-lg py-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer select-none transition-all hover:scale-[1.01] active:scale-[0.99]"
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

              {/* Trust & Guarantee Badges below Submit */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2 text-[11px] sm:text-xs font-bold text-husk/75">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-primary flex-shrink-0" /> 100% Halal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Lock size={15} className="text-primary flex-shrink-0" /> Cash on Delivery &amp; bKash
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Truck size={16} className="text-primary flex-shrink-0" /> Dhaka Express Delivery
                </span>
              </div>

            </form>
          </div>

          {/* Right Side: Summary (Shopify-Style Sticky on Desktop) */}
          <div
            className="lg:col-span-2 space-y-6 lg:sticky lg:top-28"
          >
            <div className="glass-panel p-6 sm:p-8 rounded-[2rem]">
              <h3 className="text-xl font-black text-husk mb-6 border-b border-primary/10 pb-4 text-center lg:text-left">
                Order Summary
              </h3>

              {/* Product Info Row */}
              <div className="flex gap-4 items-center pb-6 border-b border-dashed">
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border">
                  <picture>
                    <source srcSet={productImg} type="image/webp" />
                    <img src={productImgFallback} alt="Product" className="w-full h-full object-cover" loading="lazy" width={80} height={80} />
                  </picture>
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-husk text-xs sm:text-sm leading-tight">
                    Premium Coconut Pudding (6pc Box)
                  </div>
                  <p className="text-xs font-black text-primary mt-1">৳{unitPrice} / box</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center rounded-xl overflow-hidden border-2 border-primary/40 shadow-md">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ touchAction: 'manipulation' }}
                      className="w-11 h-11 flex items-center justify-center bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border-r-2 border-primary/40 transition-colors select-none text-2xl font-black cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-black text-lg text-husk select-none bg-white h-11 flex items-center justify-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(20, quantity + 1))}
                      style={{ touchAction: 'manipulation' }}
                      className="w-11 h-11 flex items-center justify-center bg-primary hover:bg-primary-dark active:bg-primary/80 text-white border-l-2 border-primary/40 transition-colors select-none text-2xl font-black cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-black text-husk text-sm">৳{totalProductPrice}</p>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="space-y-3 pt-6">
                {quantity >= 2 ? (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase">
                      <span>মূল দাম (Regular Price)</span>
                      <span className="line-through text-husk/50">৳{quantity * basePrice}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-emerald-600 uppercase">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} /> {isFreeDelivery ? "মেগা অফার ছাড় (Discount)" : "বাল্ক অফার ছাড় (Discount)"}
                      </span>
                      <span>- ৳{(quantity * basePrice) - totalProductPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase items-center">
                      <span>ডেলিভারি চার্জ</span>
                      {isFreeDelivery ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black text-xs">
                          FREE DELIVERY (৳0)
                        </span>
                      ) : (
                        <span>৳{deliveryCharge}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase">
                      <span>সাবটোটাল</span>
                      <span>৳{totalProductPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-husk/85 uppercase">
                      <span>ডেলিভারি চার্জ</span>
                      <span>৳{deliveryCharge}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-xl font-black text-husk pt-4 border-t border-dashed">
                  <span className="uppercase text-sm">সর্বমোট (Total)</span>
                  <span className="text-primary text-2xl">৳{totalOrderAmount}</span>
                </div>
              </div>
            </div>

            {/* Freshness & Quality Promise Box */}
            <div className="bg-emerald-50/80 border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-2 text-xs text-primary font-bold shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm text-[#2E4A26]">
                <ShieldCheck size={18} className="text-primary flex-shrink-0" />
                <span>Our Freshness Promise</span>
              </div>
              <p className="text-husk/80 leading-relaxed font-semibold">
                প্রতিদিন সকালে ফ্রেশ নারিকেল ও খাঁটি গরুর দুধ দিয়ে পুডিং তৈরি করা হয়। কোনো প্রকার কেমিক্যাল বা কৃত্রিম প্রিজারভেটিভ ব্যবহার করা হয় না।
              </p>
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
