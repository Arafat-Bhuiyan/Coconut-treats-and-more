import React, { useRef, useEffect, useState } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  CheckCircle, 
  Loader2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Truck, 
  Smartphone, 
  Banknote,
  ChevronRight
} from "lucide-react";
import OrderSuccessPopup from "../Order/OrderSuccessPopup";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";

const Hero = () => {
  const videoRef = useRef(null);
  const submittingRef = useRef(false);

  const [selectedPkg, setSelectedPkg] = useState(2); // Default: 2 Boxes (Most Popular)
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" (Default) | "bkash"
  const [bkashTrx, setBkashTrx] = useState("");
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    note: "",
    agree: true
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Listen for quantity changes from popups or external triggers
  useEffect(() => {
    const handleSetQuantity = (e) => {
      if (e.detail) {
        setSelectedPkg(e.detail);
      }
    };
    window.addEventListener("set-order-quantity", handleSetQuantity);
    return () => window.removeEventListener("set-order-quantity", handleSetQuantity);
  }, []);

  // Pricing calculations
  const isOne = selectedPkg === 1;
  const isTwo = selectedPkg === 2;
  const isFive = selectedPkg === 5;

  const basePrice = 750;
  const unitPrice = isFive ? 680 : isTwo ? 700 : 750;
  const totalProductPrice = isFive ? 3400 : isTwo ? 1400 : 750;
  const deliveryCharge = isFive ? 0 : 100;
  const grandTotalNumber = totalProductPrice + deliveryCharge;
  const grandTotal = `৳${grandTotalNumber.toLocaleString()}`;
  const oldPrice = isOne ? null : isTwo ? "৳1,500" : "৳3,750";
  const savingsText = isOne ? null : isTwo ? "-৳100 Saved" : "-৳350 + FREE DELIVERY";
  const deliveryText = isFive ? "FREE (৳0)" : "৳100";
  const boxCountLabel = isOne ? "1 Box (6 Cups)" : isTwo ? "2 Boxes (12 Cups)" : "5 Boxes (30 Cups)";

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

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

  const handleSubmitOrder = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Phone validation
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার মোবাইল নম্বর লিখুন।");
      const phoneInput = document.getElementsByName("phone")[0];
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const normalizedPhone = trimmedPhone.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
    const phoneClean = normalizedPhone.replace(/[^0-9]/g, '');
    let standardPhone = phoneClean.startsWith('880') ? '0' + phoneClean.slice(3) : phoneClean;
    if (standardPhone.length === 10 && standardPhone.startsWith('1')) {
      standardPhone = '0' + standardPhone;
    }
    const isValidBDPhone = standardPhone.length === 11 && standardPhone.startsWith('01');

    if (!isValidBDPhone) {
      submittingRef.current = false;
      setFormError("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)।");
      const phoneInput = document.getElementsByName("phone")[0];
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    // Address validation
    if (!formData.address.trim()) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার সম্পূর্ণ ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নম্বর) লিখুন।");
      const addressInput = document.getElementsByName("address")[0];
      if (addressInput) {
        addressInput.scrollIntoView({ behavior: "smooth", block: "center" });
        addressInput.focus();
      }
      return;
    }

    // Agreement validation
    if (!formData.agree) {
      submittingRef.current = false;
      setFormError("অর্ডার নিশ্চিত করতে শর্তাবলীতে টিক চিহ্ন দিন।");
      return;
    }

    setIsSubmitting(true);
    const fullAddress = formData.address.trim();
    const customerName = formData.name.trim() || "Customer";
    const capturedPhone = standardPhone;
    const capturedName = formData.name.trim();
    const capturedEmail = formData.email ? formData.email.trim() : "";

    const formattedPaymentNote = paymentMethod === "cod"
      ? (formData.note.trim() ? `[Cash on Delivery] ${formData.note.trim()}` : "Cash on Delivery")
      : `[bKash] TrxID/No: ${bkashTrx.trim() || "Not provided"}${formData.note.trim() ? ` | ${formData.note.trim()}` : ""}`;

    const emailPayload = {
      subject: "New Order from Website",
      from_name: customerName,
      Customer: customerName,
      Phone: capturedPhone,
      Email: capturedEmail || "N/A",
      Address: fullAddress,
      Payment_Method: paymentMethod === "cod" ? "Cash on Delivery" : "bKash",
      Note: formattedPaymentNote,
      Product: `Premium Coconut Pudding (6pc Box) - ${boxCountLabel}`,
      Quantity: `${selectedPkg} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Total_Amount: `৳${grandTotalNumber}`
    };

    // 1. Fire Facebook Purchase tracking
    trackFacebookEvent("Purchase", {
      value: grandTotalNumber,
      currency: "BDT",
      content_name: "Premium Coconut Pudding (6pc Box)",
      content_ids: ["coconut-pudding-6pc"],
      contents: [{ id: "coconut-pudding-6pc", quantity: selectedPkg, item_price: unitPrice }],
      content_type: "product",
      num_items: selectedPkg,
    }, {
      phone: capturedPhone,
      name: capturedName,
      email: capturedEmail,
      address: fullAddress,
    });

    // 2. Snappy optimistic UI feedback
    setTimeout(() => {
      submittingRef.current = false;
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
      setSelectedPkg(2);
    }, 350);

    // 3. Send order to backend with keepalive
    fetch("/api/submit-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
      keepalive: true,
    }).catch((err) => {
      console.error("Order submit error:", err);
    });
  };

  return (
    <section id="order" className="scroll-mt-20 pt-24 sm:pt-32 pb-12 sm:pb-16 px-3 sm:px-4 bg-[#F6F8F5]">
      <div className="container mx-auto max-w-5xl">
        
        {/* Dhaka City Delivery Notification Pop up (Green Flashing Pill) */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-50/95 border-2 border-[#4A6741] rounded-full text-[#1F291E] font-black text-xs sm:text-sm shadow-md text-center max-w-2xl">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A6741]"></span>
            </span>
            <MapPin size={16} className="text-[#4A6741] flex-shrink-0" />
            <span>ঢাকার সবজায়গায় ডেলিভারি করা হয় (সাভার, আশুলিয়া, যাত্রাবাড়ী, কেরানীগঞ্জ ব্যতীত)</span>
          </div>
        </div>

        {/* Unified 2-Column Shopify-Style Main Order Card */}
        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#4A6741]/15 overflow-hidden p-4 sm:p-7 md:p-9 space-y-6 md:space-y-8">
            
            {/* ROW 1: Product Showcase (Left) + Bundle Selection & Price (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* ROW 1 LEFT: Product Video + 3 Benefit Tiles + Storage Tip */}
              <div className="md:col-span-6 space-y-3.5">
                {/* Product Showcase: Split Layout (Video Card + 3 Vertical Tiles) */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  
                  {/* Left Product Video Card (~72% width) */}
                  <div className="col-span-8 bg-[#F4F7F2] rounded-3xl p-3 relative flex flex-col justify-between overflow-hidden border border-[#4A6741]/20 shadow-sm">
                    {/* Best Seller Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-[#4A6741] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
                        Best Seller
                      </span>
                    </div>

                    {/* Video Container with rounded corners & shadow */}
                    <div className="my-2 w-full aspect-square rounded-2xl overflow-hidden shadow-md bg-black/5 relative flex items-center justify-center">
                      <video 
                        ref={videoRef}
                        autoPlay
                        loop 
                        muted 
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover rounded-2xl cursor-pointer"
                        onClick={() => {
                          if (videoRef.current) {
                            if (videoRef.current.paused) videoRef.current.play().catch(() => {});
                            else videoRef.current.pause();
                          }
                        }}
                      >
                        <source src="/hero-video.mp4" type="video/mp4" />
                      </video>
                    </div>

                    {/* Bottom label under video */}
                    <div className="text-center pt-1">
                      <span className="text-[10px] font-black text-[#4A6741] uppercase tracking-wider">
                        6 Pieces Per Box • Fresh Made Daily
                      </span>
                    </div>
                  </div>

                  {/* Right 3 Stacked Benefit Tiles (~28% width) */}
                  <div className="col-span-4 flex flex-col justify-between gap-2.5">
                    {/* Tile 1: 1st Layer */}
                    <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm flex-1">
                      <span className="text-2xl mb-1">🥥</span>
                      <span className="text-[9px] font-black uppercase text-[#4A6741] tracking-wider leading-none">1st Layer</span>
                      <span className="text-[10px] font-extrabold leading-tight text-[#1F291E] mt-1">Fresh Coconut Pudding</span>
                    </div>

                    {/* Tile 2: 2nd Layer Fresh Cow Milk Pudding */}
                    <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm flex-1">
                      <span className="text-2xl mb-1">🥛</span>
                      <span className="text-[9px] font-black uppercase text-[#4A6741] tracking-wider leading-none">2nd Layer</span>
                      <span className="text-[10px] font-extrabold leading-tight text-[#1F291E] mt-1">Fresh Cow Milk Pudding</span>
                    </div>

                    {/* Tile 3: 100% Halal */}
                    <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm flex-1">
                      <span className="text-2xl mb-1">🌿</span>
                      <span className="text-[11px] font-black leading-tight text-[#4A6741] mt-1">100% Halal</span>
                    </div>
                  </div>

                </div>

                {/* 3 Benefit Trust Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F4F7F2] rounded-xl px-2 py-2 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#1F291E] leading-tight">No Preservatives</span>
                  </div>
                  <div className="bg-[#F4F7F2] rounded-xl px-2 py-2 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#1F291E] leading-tight">100% Halal</span>
                  </div>
                  <div className="bg-[#F4F7F2] rounded-xl px-2 py-2 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#1F291E] leading-tight">Fresh Made Daily</span>
                  </div>
                </div>

                {/* Storage Tip */}
                <div className="bg-emerald-50/80 border border-[#4A6741]/25 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 shadow-sm">
                  <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                    <strong>Storage Tip:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে। (Keep cups unboxed in normal fridge to maintain peak freshness).
                  </p>
                </div>
              </div>

              {/* ROW 1 RIGHT: Product Title + Bundle Selector + Price Breakdown */}
              <div className="md:col-span-6 space-y-3.5">
                {/* Rating & Social Proof */}
                <div className="flex items-center gap-2">
                  <div className="flex text-[#8DA47E] text-base">
                    ★★★★★
                  </div>
                  <span className="text-xs font-black text-[#1F291E]">4.9/5 Loved by 1,000+ Customers</span>
                </div>

                {/* Product Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1F291E] tracking-tight leading-tight">
                    Premium Coconut Pudding
                  </h1>
                </div>

                {/* Feature Pill Tags & Shelf Life */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#F4F7F2] text-[#4A6741] border border-[#4A6741]/25 px-3 py-1.5 rounded-full text-xs font-black">
                    <span>⚡</span>
                    <span>Mild Sugar Added</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-[#F4F7F2] text-[#4A6741] border border-[#4A6741]/25 px-3 py-1.5 rounded-full text-xs font-black">
                    <span>❄️</span>
                    <span>4–5 Days Shelf Life</span>
                  </span>
                </div>

                {/* Interactive Package Bundle Selector */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5">
                      <span>🏷️</span> SELECT BUNDLE &amp; SAVE:
                    </span>
                    <span className="text-xs font-black text-[#4A6741] bg-[#F4F7F2] px-3 py-1 rounded-full border border-[#4A6741]/25 shadow-sm">
                      {isFive ? "🎉 FREE DELIVERY!" : "🚚 Delivery: ৳100"}
                    </span>
                  </div>

                  {/* 3 High-Contrast Segmented Package Cards */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {/* Package 1: 1 Box */}
                    <div 
                      onClick={() => setSelectedPkg(1)}
                      className={`package-card p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative shadow-sm select-none ${
                        isOne 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-300 hover:border-[#4A6741]/60"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isOne ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {isOne && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1F291E] uppercase block tracking-wide">1 Box</span>
                        <span className="text-[11px] text-[#4A6741] font-bold block">6 Cups</span>
                      </div>
                      <div className="my-1">
                        <span className="text-lg sm:text-xl font-black text-[#1F291E]">৳750</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 block leading-tight">+ ৳100 Delivery</span>
                    </div>

                    {/* Package 2: 2 Boxes (Most Popular) */}
                    <div 
                      onClick={() => setSelectedPkg(2)}
                      className={`package-card p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative select-none ${
                        isTwo 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-300 hover:border-[#4A6741]/60 shadow-sm"
                      }`}
                    >
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4A6741] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md uppercase tracking-wider">
                        SAVE ৳100
                      </span>
                      <div className="flex items-center justify-center mb-1 mt-0.5">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isTwo ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {isTwo && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#4A6741] uppercase block tracking-wide">2 Boxes</span>
                        <span className="text-[11px] text-[#4A6741] font-extrabold block">12 Cups</span>
                      </div>
                      <div className="my-0.5">
                        <span className="text-[11px] font-bold text-gray-400 line-through block leading-none">৳1,500</span>
                        <span className="text-xl sm:text-2xl font-black text-[#4A6741] leading-tight">৳1,400</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-[#2E4A26] block leading-tight">+ ৳100 Delivery</span>
                    </div>

                    {/* Package 3: 5 Boxes (FREE DELIVERY) */}
                    <div 
                      onClick={() => setSelectedPkg(5)}
                      className={`package-card p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative select-none ${
                        isFive 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-300 hover:border-[#4A6741]/60 shadow-sm"
                      }`}
                    >
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md uppercase tracking-wider">
                        FREE DELIVERY
                      </span>
                      <div className="flex items-center justify-center mb-1 mt-0.5">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isFive ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {isFive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1F291E] uppercase block tracking-wide">5 Boxes</span>
                        <span className="text-[11px] text-[#4A6741] font-bold block">30 Cups</span>
                      </div>
                      <div className="my-0.5">
                        <span className="text-[11px] font-bold text-gray-400 line-through block leading-none">৳3,750</span>
                        <span className="text-xl sm:text-2xl font-black text-[#4A6741] leading-tight">৳3,400</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-white bg-[#4A6741] rounded-full px-2 py-0.5 block shadow-sm uppercase tracking-wide">
                        FREE DELIVERY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Unified Order Breakdown & Free Shipping Meter */}
                <div className="bg-[#F4F7F2] p-3 sm:p-4 rounded-2xl border border-[#4A6741]/20 shadow-sm space-y-2">
                  {/* Free Shipping Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#1F291E] mb-1">
                      <span className="flex items-center gap-1.5">
                        {isFive ? (
                          <span>🎉 <strong>CONGRATULATIONS! FREE DELIVERY UNLOCKED!</strong></span>
                        ) : isTwo ? (
                          <span>🚚 Add 3 more boxes for <strong>FREE Delivery</strong></span>
                        ) : (
                          <span>🚚 Add 4 more boxes for <strong>FREE Delivery</strong></span>
                        )}
                      </span>
                      <span className="text-[11px] font-black text-[#4A6741]">
                        {isFive ? "100%" : isTwo ? "40%" : "20%"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8DA47E] to-[#4A6741] rounded-full transition-all duration-300" 
                        style={{ width: isFive ? "100%" : isTwo ? "40%" : "20%" }}
                      />
                    </div>
                  </div>

                  {/* Breakdown Lines */}
                  <div className="space-y-1 pt-1.5 border-t border-dashed border-[#4A6741]/20 text-xs">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>প্যাকেজ ({boxCountLabel}):</span>
                      <div className="font-extrabold text-[#1F291E]">
                        {oldPrice && <span className="line-through text-gray-400 text-[11px] mr-1">{oldPrice}</span>}
                        <span className="text-sm font-black text-[#4A6741]">৳{totalProductPrice}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>ডেলিভারি চার্জ (ঢাকা সিটি):</span>
                      <span className={`font-black ${isFive ? "text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full" : "text-[#4A6741]"}`}>
                        {deliveryText}
                      </span>
                    </div>
                    {savingsText && (
                      <div className="flex justify-between items-center text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-black text-[11px]">
                        <span>🎉 ছাড় (Discount Unlocked):</span>
                        <span>{savingsText}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#4A6741]/20">
                      <span className="text-sm font-black text-[#1F291E]">সর্বমোট (Total Payable):</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#4A6741]">{grandTotal}</span>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি" : "বিকাশ পেমেন্ট"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* DIVIDER: Clean stylish boundary before Checkout Details */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
              <span className="flex-shrink mx-4 text-xs font-black text-[#4A6741] uppercase tracking-widest bg-emerald-50 px-4 py-1 rounded-full border border-[#4A6741]/20 shadow-sm flex items-center gap-1.5">
                <ShoppingBag size={14} /> অর্ডার ফর্ম (CHECKOUT DETAILS)
              </span>
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
            </div>

            {/* ROW 2: Delivery Details Form (Left) + Payment & Confirm Button (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* ROW 2 LEFT: Customer Info & Delivery Address Form */}
              <div className="md:col-span-6 bg-[#F4F7F2] rounded-2xl p-4 sm:p-5 border border-[#4A6741]/20 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#4A6741]/20 pb-2.5">
                  <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#4A6741]" />
                    <span>ডেলিভারি ঠিকানা ও তথ্য (Delivery Details)</span>
                  </span>
                  <span className="text-[10px] font-black text-[#4A6741] bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                    হোম ডেলিভারি
                  </span>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="customer-name" className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                      আপনার নাম (Full Name)
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="আপনার নাম লিখুন"
                      className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="customer-phone" className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                      মোবাইল নম্বর (Phone) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXX-XXXXXX"
                      className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label htmlFor="customer-address" className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                    সম্পূর্ণ ঠিকানা (Full Address) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="customer-address"
                    required
                    name="address"
                    autoComplete="street-address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="বাসা নম্বর, রোড নম্বর, ফ্ল্যাট নম্বর ও এলাকার নাম বিস্তারিত লিখুন"
                    className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all placeholder:text-gray-400 resize-none"
                  />
                  <p className="text-[10px] sm:text-[11px] font-black text-[#4A6741] pt-0.5">
                    ⚠️ অবশ্যই ফ্ল্যাট নম্বর উল্লেখ করবেন, যাতে ডেলিভারি পেতে সুবিধা হয়।
                  </p>
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <label htmlFor="customer-note" className="text-[11px] font-bold text-gray-600 block">
                    বিশেষ নির্দেশনা (Special Note - ঐচ্ছিক):
                  </label>
                  <input
                    id="customer-note"
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="ডেলিভারি সংক্রান্ত কিছু জানানোর থাকলে লিখুন..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#4A6741] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* ROW 2 RIGHT: Payment Method Selector + Submit Button */}
              <div className="md:col-span-6 space-y-3.5">
                {/* PAYMENT METHOD SELECTOR (CASH ON DELIVERY DEFAULT + BKASH) */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Banknote size={15} className="text-[#4A6741]" />
                    <span>মূল্য পরিশোধের মাধ্যম (PAYMENT METHOD):</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Cash on Delivery (Default Selected) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPaymentMethod("cod")}
                      style={{ touchAction: 'manipulation' }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                        paymentMethod === "cod"
                          ? "bg-emerald-50/90 border-[#4A6741] ring-2 ring-[#4A6741]/25 shadow-md"
                          : "bg-white border-gray-300 hover:border-gray-400 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black uppercase text-[#4A6741] flex items-center gap-1">
                          <Banknote size={14} /> Cash on Delivery
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cod" ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {paymentMethod === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900">
                        ক্যাশ অন ডেলিভারি (COD)
                      </p>
                      <p className="text-[10px] text-gray-600 font-semibold mt-0.5">
                        পণ্য পেয়ে টাকা দিন।
                      </p>
                    </div>

                    {/* Option 2: bKash */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPaymentMethod("bkash")}
                      style={{ touchAction: 'manipulation' }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                        paymentMethod === "bkash"
                          ? "bg-pink-50/90 border-[#D12053] ring-2 ring-[#D12053]/25 shadow-md"
                          : "bg-white border-gray-300 hover:border-gray-400 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black uppercase text-[#D12053] flex items-center gap-1">
                          <Smartphone size={14} /> bKash Payment
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "bkash" ? "border-[#D12053] bg-[#D12053]" : "border-gray-400"
                        }`}>
                          {paymentMethod === "bkash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900">
                        বিকাশ (Send Money)
                      </p>
                      <p className="text-[10px] text-gray-600 font-semibold mt-0.5">
                        দ্রুত ক্যাশলেস পেমেন্ট।
                      </p>
                    </div>
                  </div>

                  {/* If bKash Selected: Show Ultra-Smart Copy Button & Guide */}
                  {paymentMethod === "bkash" && (
                    <div className="bg-gradient-to-br from-pink-50/95 to-rose-50/80 p-3.5 sm:p-4 rounded-2xl border-2 border-[#D12053]/30 shadow-sm space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#D12053]/20">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#D12053] block">
                            bKash Personal Account:
                          </span>
                          <span className="text-base sm:text-lg font-black text-gray-900">
                            01618562844
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyBkash}
                          style={{ touchAction: 'manipulation' }}
                          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
                            copiedBkash
                              ? "bg-emerald-600 text-white"
                              : "bg-[#D12053] hover:bg-[#b01642] text-white"
                          }`}
                        >
                          {copiedBkash ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              <span>কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>নাম্বার কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-white/80 rounded-xl p-2.5 border border-[#D12053]/15 text-[11px] text-gray-800 space-y-1 font-medium">
                        <p className="font-extrabold text-[#D12053] text-[10px] uppercase">
                          📝 পেমেন্ট নির্দেশিকা:
                        </p>
                        <p>1. বিকাশ অ্যাপে <strong className="text-gray-900">Send Money</strong> সিলেক্ট করে <strong className="text-[#D12053] font-black">01618562844</strong> নম্বরে পাঠান।</p>
                        <p>2. মোট টাকা: <strong className="text-gray-900 font-black">{grandTotal}</strong> (ক্যাশ আউট খরচ সহ প্রযোজ্য)।</p>
                        <p>3. টাকা পাঠানোর পর TrxID বা আপনার বিকাশ নম্বর নিচের বক্সে লিখে অর্ডার কনফার্ম করুন।</p>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="bkash-trx" className="text-[11px] font-black text-[#D12053] uppercase block">
                          বিকাশ TrxID বা যে নম্বর থেকে টাকা পাঠিয়েছেন:
                        </label>
                        <input
                          id="bkash-trx"
                          type="text"
                          value={bkashTrx}
                          onChange={(e) => setBkashTrx(e.target.value)}
                          placeholder="e.g. 9J4K8L2M বা 01XXXXXXXXX"
                          className="w-full bg-white border-2 border-[#D12053]/30 rounded-xl px-3 py-2 outline-none focus:border-[#D12053] text-xs font-bold text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <input
                    type="checkbox"
                    id="terms-agree"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-0.5 accent-[#4A6741] rounded cursor-pointer"
                  />
                  <label htmlFor="terms-agree" className="text-xs font-bold text-gray-700 cursor-pointer select-none leading-snug">
                    I confirm that my information is correct and I agree to the <span className="text-[#4A6741] underline">Terms</span>.
                  </label>
                </div>

                {/* Form Error Banner */}
                {formError && (
                  <div className="bg-red-50 border-2 border-red-400 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* High-Converting Shopify-Style Call to Action Submit Button */}
                <div className="pt-0.5">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4A6741] via-[#3E5837] to-[#31462A] hover:brightness-110 active:scale-[0.98] text-white p-4 rounded-2xl shadow-xl shadow-[#4A6741]/30 flex items-center justify-between transition-all cursor-pointer select-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {/* Shiny sweep reflection */}
                    <span className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="block text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                          {isSubmitting ? "PROCESSING..." : "CONFIRM ORDER"}
                        </span>
                        <span className="block text-[11px] font-semibold text-emerald-100/90">
                          {paymentMethod === "cod" ? "Cash on Delivery • Click to Complete" : "bKash Payment • Click to Complete"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2 relative z-10">
                      <div>
                        <span className="text-lg sm:text-xl font-black block leading-tight">{grandTotal}</span>
                        <span className="text-[10px] text-emerald-100 font-bold block">
                          {isFive ? "FREE DELIVERY 🚚" : "Total Incl. Delivery"}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </button>

                  {/* Security & Guarantee Row */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-bold text-gray-500 pt-2.5">
                    <span className="flex items-center gap-1">
                      <span className="text-[#4A6741]">💵</span> Cash on Delivery
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#E2136E]">📱</span> bKash Available
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#4A6741]">⚡</span> Fresh Daily Batch
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#4A6741]">🌿</span> 100% Halal
                    </span>
                  </div>
                </div>

                {/* Incentive / Unlocked Gift Ribbon */}
                <div className="bg-emerald-50 border-2 border-dashed border-[#8DA47E] rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-center">
                  <span className="text-base">🎁</span>
                  <span className="text-[11px] font-black text-[#2B4025] uppercase tracking-wide">
                    {isFive ? (
                      <>🎉 MEGA COMBO: YOU UNLOCKED <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">FREE DELIVERY</span> + ৳350 OFF!</>
                    ) : isTwo ? (
                      <>CONGRATULATIONS, YOU UNLOCKED <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">৳100 DISCOUNT</span> WITH 2 BOXES</>
                    ) : (
                      <>ORDER 2 BOXES TO UNLOCK <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">৳100 DISCOUNT</span></>
                    )}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </form>

      </div>

      <OrderSuccessPopup 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        customerName={submittedName} 
      />
    </section>
  );
};

export default Hero;
