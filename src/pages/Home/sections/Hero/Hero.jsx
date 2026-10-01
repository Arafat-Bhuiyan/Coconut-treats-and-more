import React, { useRef, useEffect, useState } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Loader2, 
  Copy, 
  Check, 
  Smartphone, 
  Banknote,
  ChevronRight,
  Plus,
  Minus
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

  const [hasSavedInfo, setHasSavedInfo] = useState(false);

  // Auto-restore saved customer info from localStorage (Auto-fill for minimal customer effort)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coconut_customer_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.phone || parsed.address) {
          setHasSavedInfo(true);
        }
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
          email: parsed.email || prev.email,
        }));
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

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

  // Pricing calculations supporting 1, 2, 5, or ANY custom quantity
  const isOne = selectedPkg === 1;
  const isTwo = selectedPkg === 2;
  const isFive = selectedPkg === 5;
  const isCustom = !isOne && !isTwo && !isFive;

  let unitPrice = 750;
  if (selectedPkg >= 5) {
    unitPrice = 680; // Save ৳70/box + Free Delivery
  } else if (selectedPkg >= 2) {
    unitPrice = 700; // Save ৳50/box
  }

  const isFreeDelivery = selectedPkg >= 5;
  const deliveryCharge = isFreeDelivery ? 0 : 100;
  const totalProductPrice = selectedPkg * unitPrice;
  const regularTotal = selectedPkg * 750;
  const grandTotalNumber = totalProductPrice + deliveryCharge;
  const grandTotal = `৳${grandTotalNumber.toLocaleString()}`;
  const oldPrice = selectedPkg >= 2 ? `৳${regularTotal.toLocaleString()}` : null;
  const savingsText = selectedPkg >= 5 
    ? `-৳${(regularTotal - totalProductPrice).toLocaleString()} + FREE DELIVERY` 
    : selectedPkg >= 2 
      ? `-৳${(regularTotal - totalProductPrice).toLocaleString()} Saved` 
      : null;
  const deliveryText = isFreeDelivery ? "FREE (৳0)" : "৳100";
  const boxCountLabel = `${selectedPkg} ${selectedPkg === 1 ? "Box" : "Boxes"} (${selectedPkg * 6} Cups)`;

  // Handle bundle selection: scroll to order details unless package count is more than 5 boxes
  const handleSelectPackage = (pkgCount) => {
    setSelectedPkg(pkgCount);
    // User request: If adding/selecting more than 5 boxes, do not auto-scroll down to order form
    if (pkgCount > 5) return;

    setTimeout(() => {
      const formSection = document.getElementById("order-form-details");
      if (formSection) {
        const navOffset = 90;
        const targetY = formSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        // Focus name or phone input
        const nameInput = document.getElementById("customer-name");
        if (nameInput && !nameInput.value) {
          nameInput.focus();
        }
      }
    }, 100);
  };



  const handleRestoreSavedInfo = () => {
    try {
      const saved = localStorage.getItem("coconut_customer_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
          email: parsed.email || prev.email,
        }));
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormError("");
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };
      // Auto-save to localStorage so returning customer never types twice
      try {
        localStorage.setItem("coconut_customer_info", JSON.stringify({
          name: next.name,
          phone: next.phone,
          address: next.address,
          email: next.email
        }));
      } catch {
        // Ignore localStorage write errors
      }
      return next;
    });
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

    // 1. Fire Facebook Purchase tracking (wrapped in try-catch so adblockers never block orders)
    try {
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
    } catch (fbErr) {
      console.warn("FB Purchase event skipped:", fbErr);
    }

    // 2. Snappy optimistic UI feedback
    setTimeout(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmittedName(customerName);
      setShowSuccess(true);
      // Reset form keeping name/phone for convenience
      setFormData((prev) => ({
        ...prev,
        note: "",
        agree: true
      }));
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
        


        {/* Unified 2-Column Shopify-Style Main Order Card */}
        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#4A6741]/15 overflow-hidden p-4 sm:p-7 md:p-9 space-y-6 md:space-y-8">
            
            {/* ROW 1: Product Video + 3 Layers (Moved Below Video) & Bundles Selection */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* ROW 1 LEFT: Product Video + 3 Layers Below Video + 3 Badges */}
              <div className="md:col-span-6 space-y-3.5">
                
                {/* Full-Width Video Card */}
                <div className="bg-[#F4F7F2] rounded-3xl p-3 relative flex flex-col justify-between overflow-hidden border border-[#4A6741]/20 shadow-sm">
                  {/* Best Seller Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-[#4A6741] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
                      Best Seller
                    </span>
                  </div>

                  {/* Video Container (Aspect 4:5 ensures full uncropped view of all pudding cups & box) */}
                  <div className="my-2 w-full aspect-[4/5] sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-md bg-[#243520] relative flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      autoPlay
                      loop 
                      muted 
                      playsInline
                      preload="metadata"
                      poster="/hero.webp"
                      className="w-full h-full object-cover object-center rounded-2xl cursor-pointer"
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
                  <div className="text-center pt-1.5 space-y-1">
                    {/* Mobile Only: Rating directly under video */}
                    <div className="flex md:hidden items-center justify-center gap-1.5 bg-white/90 py-1 px-3.5 rounded-full border border-[#4A6741]/20 mx-auto w-fit shadow-xs">
                      <div className="flex text-[#8DA47E] text-xs">
                        ★★★★★
                      </div>
                      <span className="text-[11px] font-black text-[#1F291E]">4.9/5 Loved by 1,000+ Customers</span>
                    </div>

                    <span className="text-[11px] font-black text-[#4A6741] uppercase tracking-wider block">
                      6 Pieces Per Box • Fresh Made Daily
                    </span>
                  </div>
                </div>

                {/* 1st Layer, 2nd Layer, 100% Halal (Moved Below Video as requested!) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Tile 1: 1st Layer */}
                  <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm">
                    <span className="text-2xl mb-1">🥥</span>
                    <span className="text-[9px] font-black uppercase text-[#4A6741] tracking-wider leading-none">1st Layer</span>
                    <span className="text-[11px] font-extrabold leading-tight text-[#1F291E] mt-1">Fresh Coconut Pudding</span>
                  </div>

                  {/* Tile 2: 2nd Layer Fresh Cow Milk Pudding */}
                  <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm">
                    <span className="text-2xl mb-1">🥛</span>
                    <span className="text-[9px] font-black uppercase text-[#4A6741] tracking-wider leading-none">2nd Layer</span>
                    <span className="text-[11px] font-extrabold leading-tight text-[#1F291E] mt-1">Fresh Cow Milk Pudding</span>
                  </div>

                  {/* Tile 3: 100% Halal */}
                  <div className="bg-[#F4F7F2] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#4A6741]/20 shadow-sm">
                    <span className="text-2xl mb-1">🌿</span>
                    <span className="text-[9px] font-black uppercase text-[#4A6741] tracking-wider leading-none">Purity</span>
                    <span className="text-[11px] font-black leading-tight text-[#4A6741] mt-1">100% Halal</span>
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

              </div>

              {/* ROW 1 RIGHT: Product Title + Bundle Selector + Price Breakdown */}
              <div className="md:col-span-6 space-y-3.5">
                {/* Rating & Social Proof (Desktop only; on mobile it's directly under the video) */}
                <div className="hidden md:flex items-center gap-2">
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

                {/* Interactive Package Bundle Selector (Clicking scrolls to order form!) */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5">
                      <span>🏷️</span> SELECT BUNDLE &amp; SAVE:
                    </span>
                    <span className="text-xs font-black text-[#4A6741] bg-[#F4F7F2] px-3 py-1 rounded-full border border-[#4A6741]/25 shadow-sm">
                      {isFreeDelivery ? "🎉 FREE DELIVERY!" : "🚚 Delivery: ৳100"}
                    </span>
                  </div>

                  {/* High-Contrast Stacked Package Rows (Shopify DTC Style - Lomba Lomba) */}
                  <div className="space-y-3 pt-1">
                    {/* Row 1: 1 Box */}
                    <div 
                      onClick={() => handleSelectPackage(1)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative select-none hover:scale-[1.01] active:scale-[0.99] ${
                        isOne 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-md ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-200 hover:border-[#4A6741]/60 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isOne ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400 bg-white"
                        }`}>
                          {isOne && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-[#1F291E]">১ বক্স (৬ কাপ)</span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">1 Box</span>
                          </div>
                          <span className="text-[11px] text-gray-600 font-bold block mt-0.5">+ ৳১০০ ডেলিভারি চার্জ</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-black text-[#1F291E] leading-none">৳৭৫০</span>
                      </div>
                    </div>

                    {/* Row 2: 2 Boxes (MOST POPULAR) */}
                    <div 
                      onClick={() => handleSelectPackage(2)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative select-none hover:scale-[1.01] active:scale-[0.99] mt-3 sm:mt-3.5 ${
                        isTwo 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-md ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-200 hover:border-[#4A6741]/60 shadow-xs"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-4 bg-[#4A6741] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        🔥 MOST POPULAR • ১০০ টাকা ছাড়
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isTwo ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400 bg-white"
                        }`}>
                          {isTwo && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-[#1F291E]">২ বক্স (১২ কাপ)</span>
                            <span className="text-[10px] font-black text-[#4A6741] bg-white px-2 py-0.5 rounded-md border border-[#4A6741]/30">৳৭০০/বক্স</span>
                          </div>
                          <span className="text-[11px] text-[#4A6741] font-bold block mt-0.5">+ ৳১০০ ডেলিভারি চার্জ</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 line-through block font-bold leading-none mb-0.5">৳১,৫০০</span>
                        <span className="text-xl sm:text-2xl font-black text-[#4A6741] leading-none">৳১,৪০০</span>
                      </div>
                    </div>

                    {/* Row 3: 5 Boxes (BEST VALUE / FREE DELIVERY) */}
                    <div 
                      onClick={() => handleSelectPackage(5)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative select-none hover:scale-[1.01] active:scale-[0.99] mt-3 sm:mt-3.5 ${
                        isFive 
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-md ring-2 ring-[#4A6741]/25" 
                          : "bg-white border-gray-200 hover:border-[#4A6741]/60 shadow-xs"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-4 bg-emerald-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        🎉 BEST VALUE • ফ্রি ডেলিভারি
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isFive ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400 bg-white"
                        }`}>
                          {isFive && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-[#1F291E]">৫ বক্স (৩০ কাপ)</span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">৳৬৮০/বক্স</span>
                          </div>
                          <span className="text-[11px] font-black text-emerald-700 block mt-0.5">🚚 ফ্রি ডেলিভারি (৳০)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 line-through block font-bold leading-none mb-0.5">৳৩,৭৫০</span>
                        <span className="text-xl sm:text-2xl font-black text-[#4A6741] leading-none">৳৩,৪০০</span>
                      </div>
                    </div>

                    {/* Custom Quantity Stepper Row (Supports ANY number of boxes: 3, 4, 6, 8, 10, etc.) */}
                    <div 
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-xs select-none ${
                        isCustom
                          ? "bg-emerald-50/90 border-[#4A6741] shadow-md ring-2 ring-[#4A6741]/25"
                          : "bg-white/90 border-[#4A6741]/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isCustom ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400 bg-white"
                        }`}>
                          {isCustom && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-[#1F291E] block">
                              কাস্টম পরিমাণ (Custom):
                            </span>
                            {isCustom && (
                              <span className="text-[10px] font-black text-[#4A6741] bg-white px-2 py-0.5 rounded-md border border-[#4A6741]/30">
                                ৳{unitPrice}/বক্স
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold block mt-0.5">
                            {selectedPkg >= 5 ? "🚚 ফ্রি ডেলিভারি কার্যকর!" : "৫ বা তার বেশি বক্সে ফ্রি ডেলিভারি"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCustom && (
                          <div className="text-right mr-1 hidden sm:block">
                            {oldPrice && <span className="text-[11px] text-gray-400 line-through block font-bold leading-none mb-0.5">{oldPrice}</span>}
                            <span className="text-base font-black text-[#4A6741] leading-none">{grandTotal}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-[#F4F7F2] border border-gray-300 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPkg((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-black text-base cursor-pointer select-none active:scale-90 shadow-xs"
                            aria-label="Decrease boxes"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="w-14 text-center font-black text-xs sm:text-sm text-[#1F291E]">
                            {selectedPkg} Box{selectedPkg > 1 ? "es" : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPkg((prev) => Math.min(50, prev + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4A6741] text-white hover:bg-[#3E5837] font-black text-base cursor-pointer select-none active:scale-90 shadow-xs"
                            aria-label="Increase boxes"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unified Order Breakdown & Free Shipping Meter */}
                <div className="bg-[#F4F7F2] p-3 sm:p-4 rounded-2xl border border-[#4A6741]/20 shadow-sm space-y-2">
                  {/* Free Shipping Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#1F291E] mb-1">
                      <span className="flex items-center gap-1.5">
                        {isFreeDelivery ? (
                          <span>🎉 <strong>CONGRATULATIONS! FREE DELIVERY UNLOCKED!</strong></span>
                        ) : (
                          <span>🚚 Add {5 - selectedPkg} more {5 - selectedPkg === 1 ? "box" : "boxes"} for <strong>FREE Delivery</strong></span>
                        )}
                      </span>
                      <span className="text-[11px] font-black text-[#4A6741]">
                        {isFreeDelivery ? "100%" : `${Math.min(100, selectedPkg * 20)}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8DA47E] to-[#4A6741] rounded-full transition-all duration-300" 
                        style={{ width: isFreeDelivery ? "100%" : `${Math.min(100, selectedPkg * 20)}%` }}
                      />
                    </div>
                  </div>

                  {/* Breakdown Lines */}
                  <div className="space-y-1 pt-1.5 border-t border-dashed border-[#4A6741]/20 text-xs">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>প্যাকেজ ({boxCountLabel}):</span>
                      <div className="font-extrabold text-[#1F291E]">
                        {oldPrice && <span className="line-through text-gray-400 text-[11px] mr-1">{oldPrice}</span>}
                        <span className="text-sm font-black text-[#4A6741]">৳{totalProductPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>ডেলিভারি চার্জ (ঢাকা সিটি):</span>
                      <span className={`font-black ${isFreeDelivery ? "text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full" : "text-[#4A6741]"}`}>
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
            <div id="order-form-details" className="scroll-mt-24 relative flex py-1 items-center">
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
              <span className="flex-shrink mx-4 text-xs font-black text-[#4A6741] uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-[#4A6741]/20 shadow-sm flex items-center gap-1.5">
                <ShoppingBag size={14} /> অর্ডার ফর্ম (CHECKOUT DETAILS)
              </span>
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
            </div>

            {/* ROW 2: Delivery Details Form (Left) + Payment & Confirm Button (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* ROW 2 LEFT: Customer Info & Delivery Address Form (Auto-filled) */}
              <div className="md:col-span-6 bg-[#F4F7F2] rounded-2xl p-4 sm:p-5 border border-[#4A6741]/20 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#4A6741]/20 pb-2.5">
                  <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#4A6741]" />
                    <span>ডেলিভারি ঠিকানা ও তথ্য (Delivery Details)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasSavedInfo && (
                      <button
                        type="button"
                        onClick={handleRestoreSavedInfo}
                        className="text-[10px] font-black text-[#4A6741] bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                        title="ক্লিক করে পূর্বের সংরক্ষিত তথ্য স্বয়ংক্রিয়ভাবে বসান"
                      >
                        <span>⚡ অটো ফিল</span>
                      </button>
                    )}
                    <span className="text-[10px] font-black text-[#4A6741] bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                      হোম ডেলিভারি
                    </span>
                  </div>
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

                {/* Optional Email & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="customer-email" className="text-[11px] font-bold text-gray-600 block">
                      ইমেইল ঠিকানা (Email - ঐচ্ছিক):
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@gmail.com"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#4A6741] transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="customer-note" className="text-[11px] font-bold text-gray-600 block">
                      বিশেষ নির্দেশনা (Note - ঐচ্ছিক):
                    </label>
                    <input
                      id="customer-note"
                      type="text"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="ডেলিভারি সংক্রান্ত কিছু থাকলে..."
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#4A6741] transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* ROW 2 RIGHT: Payment Method Selector + Submit Button + Storage Tip (Directly below button!) */}
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
                          <span className="text-base sm:lg font-black text-gray-900">
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
                <div className="pt-0.5 space-y-3">
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
                          {isFreeDelivery ? "FREE DELIVERY 🚚" : "Total Incl. Delivery"}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </button>

                  {/* STORAGE TIP: Placed DIRECTLY under the CONFIRM ORDER button as requested! */}
                  <div className="bg-emerald-50/90 border border-[#4A6741]/25 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 shadow-sm">
                    <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                      <strong>Storage Tip:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে। (Keep cups unboxed in normal fridge to maintain peak freshness).
                    </p>
                  </div>

                  {/* Security & Guarantee Row */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-bold text-gray-500 pt-1">
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

                  {/* Incentive / Unlocked Gift Ribbon */}
                  <div className="bg-emerald-50 border-2 border-dashed border-[#8DA47E] rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-center">
                    <span className="text-base">🎁</span>
                    <span className="text-[11px] font-black text-[#2B4025] uppercase tracking-wide">
                      {selectedPkg >= 5 ? (
                        <>🎉 MEGA COMBO: YOU UNLOCKED <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">FREE DELIVERY</span> + ৳{((selectedPkg * 750) - totalProductPrice).toLocaleString()} OFF!</>
                      ) : selectedPkg >= 2 ? (
                        <>CONGRATULATIONS, YOU UNLOCKED <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">৳{((selectedPkg * 750) - totalProductPrice).toLocaleString()} DISCOUNT</span> WITH {selectedPkg} BOXES</>
                      ) : (
                        <>ORDER 2 BOXES TO UNLOCK <span className="bg-[#4A6741] text-white px-2 py-0.5 rounded text-[10px]">৳100 DISCOUNT</span></>
                      )}
                    </span>
                  </div>

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
