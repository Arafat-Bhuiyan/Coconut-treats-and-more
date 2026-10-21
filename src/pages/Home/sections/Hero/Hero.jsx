import React, { useRef, useEffect, useState } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Loader2, 
  Copy, 
  Check, 
  CheckCircle,
  Smartphone, 
  Banknote,
  ChevronRight,
  Star,
  Play
} from "lucide-react";
import OrderSuccessPopup from "../Order/OrderSuccessPopup";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";
import { checkRestrictedDeliveryArea } from "../../../../utils/deliveryAreaCheck";

const Hero = () => {
  const videoRef = useRef(null);
  const submittingRef = useRef(false);
  const hasInitiatedCheckoutRef = useRef(false);
  const lastOrderRef = useRef({ phone: "", timestamp: 0 });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

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
  const detectedRestrictedArea = checkRestrictedDeliveryArea(`${formData.address} ${formData.name}`);

  // Detect saved customer info in localStorage so user can 1-tap "⚡ অটো ফিল" if desired without pre-dirtying inputs
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coconut_customer_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.phone || parsed.address) {
          setHasSavedInfo(true);
        }
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = true;
    vid.setAttribute('muted', '');
    vid.setAttribute('playsinline', '');

    const tryPlay = () => {
      const p = vid.play();
      if (p !== undefined) {
        p.then(() => setIsVideoPlaying(true)).catch(() => {
          setIsVideoPlaying(false);
          // Unlock on first touch, click, or scroll
          const unlock = () => {
            vid.play().then(() => setIsVideoPlaying(true)).catch(() => {});
            ['click', 'touchstart', 'scroll'].forEach((evt) =>
              window.removeEventListener(evt, unlock)
            );
          };
          ['click', 'touchstart', 'scroll'].forEach((evt) =>
            window.addEventListener(evt, unlock, { once: true, passive: true })
          );
        });
      }
    };

    const startVideoPlayback = () => {
      if (!vid.getAttribute('src')) {
        vid.src = '/hero-video-0924.mp4';
      }
      tryPlay();
    };

    if (document.readyState === 'complete') {
      const t = setTimeout(startVideoPlayback, 40);
      return () => clearTimeout(t);
    } else {
      window.addEventListener('load', startVideoPlayback, { once: true });
    }

    const onPlay = () => setIsVideoPlaying(true);
    const onPause = () => setIsVideoPlaying(false);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);

    return () => {
      window.removeEventListener('load', startVideoPlayback);
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
    };
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

  // Pricing calculations (1 Box = ৳750, 2+ Boxes = ৳700/box with bulk discount, 5+ Boxes = Free Delivery)
  const basePrice = 750;
  const offerPrice = 700;
  const unitPrice = selectedPkg >= 2 ? offerPrice : basePrice;
  const isFreeDelivery = selectedPkg >= 5;
  const deliveryCharge = isFreeDelivery ? 0 : 100;
  const giftCharge = isGift ? 100 : 0;
  const totalProductPrice = selectedPkg * unitPrice;
  const regularTotal = selectedPkg * basePrice;
  const discountAmount = regularTotal - totalProductPrice;
  const grandTotalNumber = totalProductPrice + deliveryCharge + giftCharge;
  const grandTotal = `৳${grandTotalNumber.toLocaleString()}`;
  const boxCountLabel = `${selectedPkg} ${selectedPkg === 1 ? "Box" : "Boxes"} (${selectedPkg * 6} Cups)`;
  const isPhoneValid = formData.phone.length === 11 && formData.phone.startsWith("01");

  // Emit package & price updates for the floating sticky order bar
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sticky-order-info", {
      detail: { selectedPkg, grandTotal }
    }));
  }, [selectedPkg, grandTotal]);

  const triggerInitiateCheckoutOnce = (overrideUserData = {}) => {
    if (hasInitiatedCheckoutRef.current) return;
    hasInitiatedCheckoutRef.current = true;
    try {
      trackFacebookEvent("InitiateCheckout", {
        content_name: "Premium Coconut Pudding (6pc Box)",
        content_ids: ["coconut-pudding-6pc"],
        content_type: "product",
        value: grandTotalNumber,
        num_items: selectedPkg,
        currency: "BDT"
      }, overrideUserData);
    } catch {
      // Ignore tracking errors
    }
  };

  const scrollToCheckout = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    triggerInitiateCheckoutOnce();
    const formSection = document.getElementById("order-form-details");
    if (formSection) {
      const navOffset = 90;
      const targetY = formSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    }
  };

  const handleRestoreSavedInfo = () => {
    setOrderPlaced(false);
    setFormError("");
    submittingRef.current = false;
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
    submittingRef.current = false;
    if (orderPlaced) setOrderPlaced(false);
    triggerInitiateCheckoutOnce();

    let nextVal = type === "checkbox" ? checked : value;
    if (name === "phone") {
      const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
      let clean = String(value).replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
      clean = clean.replace(/[^0-9]/g, '');
      if (clean.startsWith('00880')) clean = clean.slice(4);
      else if (clean.startsWith('880')) clean = clean.slice(2);
      else if (clean.startsWith('8801')) clean = clean.slice(2);
      if (clean.length >= 10 && clean.startsWith('1')) {
        clean = '0' + clean;
      }
      nextVal = clean.slice(0, 11);
    }

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: nextVal
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

    // Read from React state with DOM fallback (ensures Mobile Autofill in iOS/Android/In-App browsers never fails)
    const domPhone = document.getElementById("customer-phone")?.value || "";
    const domAddress = document.getElementById("customer-address")?.value || "";
    const domName = document.getElementById("customer-name")?.value || "";
    const domEmail = document.getElementById("customer-email")?.value || "";
    const domNote = document.getElementById("customer-note")?.value || "";

    const rawPhone = (formData.phone || domPhone).trim();
    const rawAddress = (formData.address || domAddress).trim();
    const rawName = (formData.name || domName).trim();
    const rawEmail = (formData.email || domEmail).trim();
    const rawNote = (formData.note || domNote).trim();

    // Phone validation
    if (!rawPhone) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার মোবাইল নম্বর লিখুন।");
      const phoneInput = document.getElementById("customer-phone");
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const normalizedPhone = rawPhone.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
    let phoneClean = normalizedPhone.replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('00880')) phoneClean = phoneClean.slice(4);
    else if (phoneClean.startsWith('880')) phoneClean = phoneClean.slice(2);
    if (phoneClean.length === 10 && phoneClean.startsWith('1')) {
      phoneClean = '0' + phoneClean;
    }
    const standardPhone = phoneClean.slice(0, 11);
    const isValidBDPhone = standardPhone.length === 11 && standardPhone.startsWith('01');

    if (!isValidBDPhone) {
      submittingRef.current = false;
      setFormError("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)।");
      const phoneInput = document.getElementById("customer-phone");
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
      return;
    }

    // Address validation
    if (!rawAddress) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার সম্পূর্ণ ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নম্বর) লিখুন।");
      const addressInput = document.getElementById("customer-address");
      if (addressInput) {
        addressInput.scrollIntoView({ behavior: "smooth", block: "center" });
        addressInput.focus();
      }
      return;
    }

    // Restricted delivery area validation (outside Dhaka divisions & areas)
    const restrictedMatch = checkRestrictedDeliveryArea(`${rawAddress} ${rawName}`);
    if (restrictedMatch) {
      submittingRef.current = false;
      setFormError(`🚫 দুঃখিত! এই অর্ডার আপনার ঠিকানায় (${restrictedMatch.displayText}) ডেলিভারি করা সম্ভব নয়। আমাদের ডেলিভারি শুধুমাত্র ঢাকা সিটির ভেতরে সীমাবদ্ধ (ঢাকার বাইরে কোনো ডেলিভারি হয় না)।`);
      const addressInput = document.getElementById("customer-address");
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

    // Client-side double-tap guard (only blocks accidental double-tap within 2.5s for exact same order)
    const now = Date.now();
    const orderFingerprint = `${standardPhone}_${rawAddress}_${selectedPkg}`;
    if (
      lastOrderRef.current.phone === orderFingerprint &&
      now - lastOrderRef.current.timestamp < 2500
    ) {
      submittingRef.current = false;
      setShowSuccess(true);
      return;
    }

    submittingRef.current = true;
    lastOrderRef.current = { phone: orderFingerprint, timestamp: now };
    setIsSubmitting(true);

    const fullAddress = rawAddress;
    const customerName = rawName || "Customer";
    const capturedPhone = standardPhone;
    const capturedName = rawName;
    const capturedEmail = rawEmail;

    const formattedPaymentNote = paymentMethod === "cod"
      ? (rawNote ? `[Cash on Delivery] ${rawNote}` : "Cash on Delivery")
      : `[bKash] TrxID/No: ${bkashTrx.trim() || "Not provided"}${rawNote ? ` | ${rawNote}` : ""}`;

    const giftNote = isGift
      ? ` | [🎁 GIFT ORDER (+৳100) - Card Note: "${giftMessage.trim() || "শুভেচ্ছা রইলো"}"]`
      : "";
    const combinedNote = `${formattedPaymentNote}${giftNote}`;

    const emailPayload = {
      subject: `New Order${isGift ? " 🎁 [GIFT +৳100]" : ""}: ${customerName}`,
      from_name: customerName,
      Customer: customerName,
      Phone: capturedPhone,
      Email: capturedEmail || "N/A",
      Address: fullAddress,
      Payment_Method: paymentMethod === "cod" ? "Cash on Delivery" : "bKash",
      Note: combinedNote,
      Product: `Premium Coconut Pudding (6pc Box)${isGift ? " 🎁 [GIFT PACK +৳100]" : ""} - ${boxCountLabel}`,
      Quantity: `${selectedPkg} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Gift_Charge: isGift ? "৳100" : "৳0",
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

    // 1b. Fire Google Analytics 4 Purchase tracking event
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', {
          transaction_id: `ORD_${Date.now()}`,
          value: grandTotalNumber,
          currency: 'BDT',
          items: [{
            item_name: 'Premium Coconut Pudding (6pc Box)',
            quantity: selectedPkg,
            price: unitPrice
          }]
        });
      }
    } catch (gaErr) {
      console.warn("GA Purchase event skipped:", gaErr);
    }

    // 2. Snappy optimistic UI feedback
    setTimeout(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
      setOrderPlaced(true);
      setSubmittedName(customerName);
      setShowSuccess(true);
      setHasSavedInfo(true);
      // Reset form cleanly so subsequent orders never concatenate previous inputs
      setFormData({
        name: "",
        phone: "",
        address: "",
        email: "",
        note: "",
        agree: true
      });
      setPaymentMethod("cod");
      setBkashTrx("");
      setSelectedPkg(2);
    }, 350);

    // 3. Send order to backend with keepalive + 3-attempt client-side resilience retry
    const sendOrderToServer = async (attempt = 1) => {
      try {
        const res = await fetch("/api/submit-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
          keepalive: true,
        });
        if (!res.ok && attempt < 3) {
          setTimeout(() => sendOrderToServer(attempt + 1), 600 * attempt);
        }
      } catch (err) {
        if (attempt < 3) {
          setTimeout(() => sendOrderToServer(attempt + 1), 600 * attempt);
        } else {
          console.error("Order submit error:", err);
        }
      }
    };
    sendOrderToServer();
  };

  return (
    <section id="order" className="scroll-mt-20 pt-24 sm:pt-32 pb-12 sm:pb-16 px-3 sm:px-4 bg-[#F6F8F5]">
      <div className="container mx-auto max-w-5xl">
        


        {/* Unified 2-Column Shopify-Style Main Order Card */}
        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#4A6741]/15 overflow-hidden p-4 sm:p-7 md:p-9 space-y-6 md:space-y-8">
            
            {/* ROW 1: Requested Day-1 Hero Layout (Left: Logo, Badge, Title, Description, Button, 500+ Happy Customers) + (Right: Video) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
              
              {/* ROW 1 LEFT: Logo, Title, Natural badge, Description and Order CTA (order-2 on mobile, md:order-1 on PC) */}
              <div className="md:col-span-6 space-y-5 text-left order-2 md:order-1">
                {/* Logo */}
                <div>
                  <img 
                    src="/logo.webp" 
                    alt="Coconut Treats & More" 
                    width={128}
                    height={128}
                    fetchPriority="high"
                    className="w-24 sm:w-32 h-auto object-contain drop-shadow-sm" 
                  />
                </div>

                {/* 100% Natural Ingredients Badge & 4.9/5 Gold Rating Badge */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8DA47E]/20 text-[#4A6741] font-bold text-xs sm:text-sm">
                    100% Natural Ingredients
                  </span>

                  {/* Smart Gold/Yellow Rating Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300/80 shadow-2xs">
                    <div className="flex items-center text-amber-500 gap-0.5">
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                    </div>
                    <span className="text-xs font-black text-amber-950 tracking-tight">
                      4.9 out of 5
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      • 1,000+ Customers
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#2C332A] leading-tight tracking-tight break-words">
                  Fresh Homemade <br />
                  <span className="text-[#4A6741]">Premium Coconut Pudding</span>
                </h1>

                {/* 4 Feature Specification Cards (from 2nd screenshot - compact yet crystal clear) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl text-left pt-0.5 pb-1">
                  {/* Top Layer */}
                  <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-2xs">
                    <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">🥥</span>
                    <div className="space-y-0.5 leading-snug">
                      <p className="text-xs font-bold text-[#1F291E]">
                        <strong className="text-[#3E6533]">টপ লেয়ার (Top Layer):</strong> রিফ্রেশিং ফ্রেশ ডাবের পানি ও নরম ডাবের মিষ্টি শাঁস এর পুডিং।
                      </p>
                      <p className="text-[10px] sm:text-[10.5px] text-gray-500 font-medium">
                        Refreshing fresh green coconut water & tender coconut chunks.
                      </p>
                    </div>
                  </div>

                  {/* Bottom Layer */}
                  <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-2xs">
                    <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">🥛</span>
                    <div className="space-y-0.5 leading-snug">
                      <p className="text-xs font-bold text-[#1F291E]">
                        <strong className="text-[#3E6533]">বটম লেয়ার (Bottom Layer):</strong> খাঁটি গাভীর দুধের পুষ্টিকর, রিচ ও ক্রিমি সিল্কি পুডিং।
                      </p>
                      <p className="text-[10px] sm:text-[10.5px] text-gray-500 font-medium">
                        Nutritious, rich, creamy & velvety pure cow milk pudding.
                      </p>
                    </div>
                  </div>

                  {/* Pack Size */}
                  <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-2xs">
                    <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">📦</span>
                    <div className="space-y-0.5 leading-snug">
                      <p className="text-xs font-bold text-[#1F291E]">
                        <strong className="text-[#3E6533]">প্যাক সাইজ (Pack Size):</strong> প্রতি বক্সে ৬ কাপ • প্রতিদিন সকালে টাটকা তৈরি।
                      </p>
                      <p className="text-[10px] sm:text-[10.5px] text-gray-500 font-medium">
                        6 Cups per Box • Freshly handcrafted every morning.
                      </p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-2xs">
                    <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">❄️</span>
                    <div className="space-y-0.5 leading-snug">
                      <p className="text-xs font-bold text-[#1F291E]">
                        <strong className="text-[#3E6533]">সংরক্ষণ (Storage):</strong> ৪–৫ দিন নরমাল ফ্রিজে রেখে স্বাচ্ছন্দ্যে উপভোগ করুন।
                      </p>
                      <p className="text-[10px] sm:text-[10.5px] text-gray-500 font-medium">
                        Keeps 4–5 days fresh in standard refrigerator.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SMART ORDER NOW BUTTON (as in 3rd screenshot) & 500+ happy customers */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <a
                    href="#order-form-details"
                    onClick={(e) => {
                      if (e && typeof e.preventDefault === 'function') e.preventDefault();
                      scrollToCheckout(e);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2B4C23] via-[#3E6533] to-[#2B4C23] hover:from-[#355D2B] hover:via-[#47733B] hover:to-[#355D2B] active:scale-[0.98] text-white font-black py-3.5 px-6 sm:px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-[#2B4C23]/35 ring-1 ring-white/20 text-base sm:text-lg cursor-pointer select-none text-center"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={18} className="text-emerald-100" />
                    </div>
                    <span className="tracking-tight">
                      Order Now <span className="text-emerald-200 font-bold">(কুইক অর্ডার)</span>
                    </span>
                    <ChevronRight size={18} strokeWidth={3} className="text-white group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="flex items-center gap-2.5 px-1">
                    <div className="flex -space-x-2">
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="/avatars/customer-1.webp" alt="Bangladeshi Customer 1" width={36} height={36} loading="lazy" decoding="async" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="/avatars/customer-2.webp" alt="Bangladeshi Customer 2" width={36} height={36} loading="lazy" decoding="async" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="/avatars/customer-3.webp" alt="Bangladeshi Customer 3" width={36} height={36} loading="lazy" decoding="async" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="/avatars/customer-4.webp" alt="Bangladeshi Customer 4" width={36} height={36} loading="lazy" decoding="async" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#2C332A]/70">
                      <span className="text-[#4A6741] font-black">1000+</span> happy customers
                    </p>
                  </div>
                </div>
              </div>


              {/* ROW 1 RIGHT: Product Video (order-1 on mobile, md:order-2 on PC) */}
              <div className="md:col-span-6 space-y-4 order-1 md:order-2">
                {/* Video Card */}
                <div className="bg-[#F4F7F2] rounded-3xl p-3 relative flex flex-col justify-between overflow-hidden border border-[#4A6741]/20 shadow-md">
                  {/* Best Seller Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-[#4A6741] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
                      Best Seller
                    </span>
                  </div>

                  {/* Floating Badge (with gentle playful sway animation) */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-[#8DA47E]/20 z-20 animate-float-sway select-none pointer-events-none">
                    <div className="bg-[#97BC62]/20 p-1.5 rounded-lg text-lg sm:text-xl">🥥</div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-semibold leading-tight">Made Fresh</p>
                      <p className="font-extrabold text-[#2C332A] text-xs sm:text-sm leading-tight">Every Morning</p>
                    </div>
                  </div>

                  {/* Video Container (Aspect 4:5 ensures full uncropped view of all pudding cups & box) */}
                  <div 
                    onClick={() => {
                      if (videoRef.current) {
                        if (!videoRef.current.getAttribute('src')) {
                          videoRef.current.src = '/hero-video-0924.mp4';
                        }
                        if (videoRef.current.paused) {
                          videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
                        } else {
                          videoRef.current.pause();
                          setIsVideoPlaying(false);
                        }
                      }
                    }}
                    className="my-2 w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md bg-[#243520] relative flex items-center justify-center cursor-pointer group"
                  >
                    <video 
                      ref={videoRef}
                      autoPlay
                      loop 
                      muted 
                      playsInline
                      preload="none"
                      poster="/video-poster-0924.webp"
                      className="w-full h-full object-cover object-center rounded-2xl"
                    />

                    {/* Play/Pause Overlay button when paused or blocked by browser power-saving */}
                    {!isVideoPlaying && (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10 transition-all select-none">
                        <div className="w-14 h-14 rounded-full bg-white/95 text-[#4A6741] flex items-center justify-center shadow-2xl transform group-hover:scale-110 active:scale-95 transition-transform">
                          <Play size={26} className="ml-1 fill-current" />
                        </div>
                        <span className="text-white text-xs font-black bg-black/60 px-3.5 py-1 rounded-full shadow-md">
                          ভিডিওটি প্লে করতে চাপ দিন ▶
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom label under video */}
                  <div className="text-center pt-1.5">
                    <span className="text-[11px] font-black text-[#4A6741] uppercase tracking-wider block">
                      6 Pieces Per Box • Fresh Made Daily
                    </span>
                  </div>
                </div>

                {/* SMART QUICK ORDER BUTTON DIRECTLY UNDER VIDEO (as in 3rd screenshot) */}
                <div className="pt-2">
                  <a
                    href="#order-form-details"
                    onClick={(e) => {
                      if (e && typeof e.preventDefault === 'function') e.preventDefault();
                      scrollToCheckout(e);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2B4C23] via-[#3E6533] to-[#2B4C23] hover:from-[#355D2B] hover:via-[#47733B] hover:to-[#355D2B] active:scale-[0.98] text-white font-black py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-[#2B4C23]/35 ring-1 ring-white/20 text-base sm:text-lg cursor-pointer select-none text-center"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={18} className="text-emerald-100" />
                    </div>
                    <span className="tracking-tight">
                      Order Now <span className="text-emerald-200 font-bold">(কুইক অর্ডার)</span>
                    </span>
                    <ChevronRight size={18} strokeWidth={3} className="text-white group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>


            </div>

            {/* DIVIDER: Clean stylish boundary before Checkout Details (tar niche order form thakbe) */}
            <div id="order-form-details" className="scroll-mt-24 relative flex py-1 items-center">
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
              <span className="flex-shrink mx-4 text-xs font-black text-[#4A6741] uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-[#4A6741]/20 shadow-sm flex items-center gap-1.5">
                <ShoppingBag size={14} /> অর্ডার ফর্ম (CHECKOUT DETAILS)
              </span>
              <div className="flex-grow border-t-2 border-[#4A6741]/15"></div>
            </div>

            {/* CHECKOUT ROW: Column 1 (Order Summary + Gift Card + Payment) | Column 2 (Delivery Details + Confirm Order) */}
            <div id="checkout-grid-container" className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* COLUMN 1: Order Summary (Top) + Gift Card Option (Middle) + Payment Method Selector (Bottom) */}
              <div className="md:col-span-6 space-y-4">
                {/* 1. ORDER SUMMARY CARD */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#4A6741]/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag size={16} className="text-[#4A6741]" />
                      <span>Order Summary</span>
                    </span>
                    <span className="text-[11px] font-black text-[#4A6741] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      {boxCountLabel}
                    </span>
                  </div>

                  {/* Product Info Row */}
                  <div className="flex gap-3 sm:gap-4 items-center pb-4 border-b border-dashed border-gray-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                      <picture>
                        <source srcSet="/pudding-3d.webp" type="image/webp" />
                        <img
                          src="/pudding-3d.jpg"
                          alt="Premium Coconut Pudding"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={80}
                          height={80}
                        />
                      </picture>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-[#1F291E] text-xs sm:text-sm leading-snug">
                        Premium Coconut Pudding (6pc Box)
                      </div>
                      <p className="text-xs sm:text-sm font-black text-[#4A6741] mt-1">
                        ৳{unitPrice} / box
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center rounded-xl overflow-hidden border-2 border-[#4A6741]/40 shadow-xs bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const nextPkg = Math.max(1, selectedPkg - 1);
                            setSelectedPkg(nextPkg);
                            try {
                              trackFacebookEvent("AddToCart", {
                                content_name: "Premium Coconut Pudding (6pc Box)",
                                content_ids: ["coconut-pudding-6pc"],
                                content_type: "product",
                                value: nextPkg * (nextPkg >= 2 ? offerPrice : basePrice),
                                num_items: nextPkg,
                                currency: "BDT"
                              });
                            } catch { /* ignore */ }
                          }}
                          style={{ touchAction: "manipulation" }}
                          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#4A6741]/10 hover:bg-[#4A6741]/20 active:bg-[#4A6741]/30 text-[#4A6741] border-r-2 border-[#4A6741]/40 transition-colors select-none text-xl sm:text-2xl font-black cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 sm:w-12 text-center font-black text-base sm:text-lg text-[#1F291E] select-none bg-white h-10 sm:h-11 flex items-center justify-center">
                          {selectedPkg}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextPkg = Math.min(50, selectedPkg + 1);
                            setSelectedPkg(nextPkg);
                            try {
                              trackFacebookEvent("AddToCart", {
                                content_name: "Premium Coconut Pudding (6pc Box)",
                                content_ids: ["coconut-pudding-6pc"],
                                content_type: "product",
                                value: nextPkg * (nextPkg >= 2 ? offerPrice : basePrice),
                                num_items: nextPkg,
                                currency: "BDT"
                              });
                            } catch { /* ignore */ }
                          }}
                          style={{ touchAction: "manipulation" }}
                          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#4A6741] hover:bg-[#3E5837] active:bg-[#32492c] text-white border-l-2 border-[#4A6741]/40 transition-colors select-none text-xl sm:text-2xl font-black cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-black text-[#1F291E] text-sm sm:text-base">
                        ৳{totalProductPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Summary Totals Breakdown */}
                  <div className="space-y-2 pt-0.5">
                    {selectedPkg >= 2 ? (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-600 uppercase">
                          <span>মূল দাম (REGULAR PRICE)</span>
                          <span className="line-through text-gray-400 font-bold">
                            ৳{regularTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-emerald-600 uppercase">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle size={15} /> বাল্ক অফার ছাড় (DISCOUNT)
                          </span>
                          <span className="font-black">- ৳{discountAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-600 uppercase">
                          <span>ডেলিভারি চার্জ</span>
                          {isFreeDelivery ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                              <span className="line-through text-gray-400 font-normal">৳১০০</span>
                              <span>ফ্রি (৳০)</span>
                            </span>
                          ) : (
                            <span>৳১০০</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-600 uppercase">
                          <span>সাবটোটাল</span>
                          <span>৳{totalProductPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-600 uppercase">
                          <span>ডেলিভারি চার্জ</span>
                          <span>৳{deliveryCharge}</span>
                        </div>
                      </>
                    )}

                    {isGift && (
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-amber-900 uppercase bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-300">
                        <span className="flex items-center gap-1.5">
                          <span>🎁</span> গিফট কার্ড
                        </span>
                        <span className="font-black text-amber-950">+ ৳১০০</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-lg sm:text-xl font-black text-[#1F291E] pt-3 border-t border-dashed border-gray-300">
                      <span className="uppercase text-xs sm:text-sm font-black">সর্বমোট (TOTAL)</span>
                      <span className="text-[#4A6741] text-xl sm:text-2xl font-black">
                        {grandTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SEND AS A GIFT OPTION (Placed right between Order Summary and Payment Method) */}
                <div 
                  id="gift-card-box-container"
                  className={`relative z-10 rounded-2xl transition-all border-2 w-full overflow-hidden ${
                    isGift 
                      ? "bg-gradient-to-br from-[#FFFDF5] via-amber-50/70 to-[#FFF9ED] border-amber-500 shadow-md ring-2 ring-amber-400/20" 
                      : "bg-gradient-to-br from-[#FFFDF9] via-amber-50/40 to-[#FFFDF5] border-amber-300 hover:border-amber-400 hover:shadow-xs"
                  }`}
                >
                  {/* Semantic Native Button - 100% Guaranteed cross-browser click & tap trigger */}
                  <button
                    type="button"
                    id="gift-card-toggle-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsGift((prev) => !prev);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full p-3.5 sm:p-4 text-left flex items-start gap-3 cursor-pointer select-none bg-transparent border-0 outline-none transition-all active:scale-[0.99]"
                    aria-pressed={isGift}
                  >
                    {/* Visual Checkbox Indicator */}
                    <div 
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 pointer-events-none ${
                        isGift 
                          ? "bg-[#4A6741] border-[#4A6741] text-white shadow-xs" 
                          : "bg-white border-amber-400 hover:border-amber-500"
                      }`}
                    >
                      {isGift && <Check size={14} strokeWidth={3.5} className="text-white" />}
                    </div>

                    <div className="flex-1 min-w-0 pointer-events-none">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-lg flex-shrink-0">🎁</span>
                          <span className="text-xs sm:text-sm font-black text-amber-950 tracking-tight">
                            প্রিয়জনকে গিফট কার্ড পাঠাতে চান?
                          </span>
                        </div>
                        <span className={`text-[10.5px] sm:text-[11px] font-black px-2 py-0.5 rounded-full border transition-all ${
                          isGift 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                            : "bg-amber-100/80 text-amber-900 border-amber-300"
                        }`}>
                          {isGift ? "✓ সিলেক্ট করা হয়েছে" : "+ ৳১০০"}
                        </span>
                      </div>

                      {/* Sleek Emotional Subtitle */}
                      <p className="text-[11px] sm:text-[11.5px] text-amber-900/80 font-medium mt-1 leading-snug">
                        আপনার মনের কথা বা wish লিখে দিন — আমরা তা প্রিমিয়াম কার্ডে লিখে উপহার বক্স সহ পৌঁছে দেব।
                      </p>
                    </div>
                  </button>

                  {/* Hidden accessibility input keeping compatibility with automated checks */}
                  <input
                    type="checkbox"
                    id="gift-option-checkbox"
                    name="gift-option-checkbox"
                    checked={isGift}
                    readOnly
                    className="sr-only"
                    tabIndex={-1}
                  />

                  {/* Expanded Section: completely outside the button, so inputs and buttons never interfere! */}
                  {isGift && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 space-y-2.5 pt-2 border-t border-amber-200/80 animate-fade-in">
                      <div className="space-y-1">
                        <label htmlFor="gift-message-input" className="text-[11px] sm:text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <span>✍️</span>
                          <span>কার্ডে আপনার শুভেচ্ছা বার্তা (Wish Note):</span>
                        </label>
                        <input
                          id="gift-message-input"
                          type="text"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="e.g. শুভ জন্মদিন প্রিয়! / সুস্থ থাকুন / অনেক ভালোবাসা রইলো..."
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-base sm:text-xs font-bold text-gray-900 outline-none focus:border-[#4A6741] placeholder:text-gray-400 shadow-inner"
                          style={{ touchAction: 'manipulation' }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-900">কুইক উইশ:</span>
                        {[
                          "শুভ জন্মদিন! 🎂", 
                          "দ্রুত সুস্থ হয়ে উঠুন 🌸", 
                          "অনেক ভালোবাসা রইলো ❤️", 
                          "উপহারটি গ্রহণ করুন 🎁"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setGiftMessage(preset);
                            }}
                            className="text-[10px] sm:text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <div className="bg-amber-100/60 border border-amber-300/70 rounded-xl p-2 flex items-center gap-2">
                        <span className="text-sm flex-shrink-0">💌</span>
                        <p className="text-[10.5px] font-bold text-amber-950 leading-snug">
                          আপনার মনের কথাটি প্রিমিয়াম শুভেচ্ছা কার্ডে লিখে উপহার বক্সের সাথে পৌঁছে দেওয়া হবে। (চার্জ: ৳১০০)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. PAYMENT METHOD SELECTOR */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Banknote size={15} className="text-[#4A6741]" />
                    <span>মূল্য পরিশোধের মাধ্যম (PAYMENT METHOD):</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Cash on Delivery (Default Selected) */}
                    <button
                      type="button"
                      id="payment-method-cod"
                      aria-pressed={paymentMethod === "cod"}
                      onClick={() => setPaymentMethod("cod")}
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                        paymentMethod === "cod"
                          ? "bg-emerald-50/90 border-[#4A6741] ring-2 ring-[#4A6741]/25 shadow-md"
                          : "bg-white border-gray-300 hover:border-gray-400 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 w-full pointer-events-none">
                        <span className="text-[11px] font-black uppercase text-[#4A6741] flex items-center gap-1">
                          <Banknote size={14} /> Cash on Delivery
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cod" ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {paymentMethod === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900 pointer-events-none">
                        ক্যাশ অন ডেলিভারি (COD)
                      </p>
                      <p className="text-[10px] text-gray-600 font-semibold mt-0.5 pointer-events-none">
                        পণ্য পেয়ে টাকা দিন।
                      </p>
                    </button>

                    {/* Option 2: bKash */}
                    <button
                      type="button"
                      id="payment-method-bkash"
                      aria-pressed={paymentMethod === "bkash"}
                      onClick={() => setPaymentMethod("bkash")}
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                        paymentMethod === "bkash"
                          ? "bg-pink-50/90 border-[#D12053] ring-2 ring-[#D12053]/25 shadow-md"
                          : "bg-white border-gray-300 hover:border-gray-400 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 w-full pointer-events-none">
                        <span className="text-[11px] font-black uppercase text-[#D12053] flex items-center gap-1">
                          <Smartphone size={14} /> bKash Payment
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "bkash" ? "border-[#D12053] bg-[#D12053]" : "border-gray-400"
                        }`}>
                          {paymentMethod === "bkash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900 pointer-events-none">
                        বিকাশ (Send Money)
                      </p>
                      <p className="text-[10px] text-gray-600 font-semibold mt-0.5 pointer-events-none">
                        দ্রুত ক্যাশলেস পেমেন্ট।
                      </p>
                    </button>
                  </div>

                  {/* If bKash Selected: Show Ultra-Smart Copy Button & Guide */}
                  {paymentMethod === "bkash" && (
                    <div className="bg-gradient-to-br from-pink-50/95 to-rose-50/80 p-3.5 sm:p-4 rounded-2xl border-2 border-[#D12053]/30 shadow-sm space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#D12053]/20">
                        <div 
                          onClick={handleCopyBkash} 
                          className="cursor-pointer select-none group"
                          title="ক্লিক করে নাম্বারটি কপি করুন"
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#D12053] block">
                            bKash Personal Account (ক্লিক করে কপি):
                          </span>
                          <span className="text-base sm:text-lg font-black text-gray-900 group-hover:text-[#D12053] transition-colors">
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
                          style={{ touchAction: 'manipulation' }}
                          className="w-full bg-white border-2 border-[#D12053]/30 rounded-xl px-3 py-2 outline-none focus:border-[#D12053] text-base sm:text-xs font-bold text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: Delivery Details Form (Top) + Terms Checkbox + Confirm Order + Storage Tip (Bottom) */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#4A6741]/40 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={16} className="text-[#4A6741]" />
                      <span>ডেলিভারি ঠিকানা ও তথ্য (Delivery Details)</span>
                    </span>
                    {hasSavedInfo && (
                      <button
                        type="button"
                        onClick={handleRestoreSavedInfo}
                        style={{ touchAction: 'manipulation' }}
                        className="text-[10px] font-black text-[#4A6741] bg-emerald-50 hover:bg-emerald-100 border border-[#4A6741]/20 px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                        title="ক্লিক করে পূর্বের সংরক্ষিত তথ্য স্বয়ংক্রিয়ভাবে বসান"
                      >
                        <span>⚡ অটো ফিল</span>
                      </button>
                    )}
                  </div>

                  {/* Top Form Error Banner (Visible immediately even when mobile keyboard is open!) */}
                  {formError && (
                    <div className="bg-red-50 border-2 border-red-400 text-red-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                      <span className="text-base flex-shrink-0">⚠️</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="customer-name" className="text-xs sm:text-[11px] font-black text-gray-700 uppercase tracking-wider block">
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
                        style={{ touchAction: 'manipulation' }}
                        className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-bold text-gray-900 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="customer-phone" className="text-xs sm:text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                          মোবাইল নম্বর (Phone) <span className="text-red-500">*</span>
                        </label>
                        {isPhoneValid && (
                          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check size={12} strokeWidth={3} /> সঠিক নম্বর
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="customer-phone"
                          type="tel"
                          required
                          name="phone"
                          autoComplete="tel"
                          inputMode="numeric"
                          maxLength={20}
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="01XXXXXXXXX"
                          style={{ touchAction: 'manipulation' }}
                          className={`w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                            isPhoneValid
                              ? "border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                              : formData.phone.length > 0 && formData.phone.length < 11
                                ? "border-amber-400 focus:border-amber-500"
                                : "border-gray-300 focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="customer-address" className="text-xs sm:text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                        সম্পূর্ণ ঠিকানা (Full Address) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#4A6741] bg-emerald-50 px-2 py-0.5 rounded-full border border-[#4A6741]/20">
                        ঢাকা সিটি
                      </span>
                    </div>
                    <textarea
                      id="customer-address"
                      required
                      name="address"
                      autoComplete="street-address"
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="বাসা নম্বর, রোড নম্বর, ফ্ল্যাট নম্বর ও এলাকার নাম বিস্তারিত লিখুন"
                      style={{ touchAction: 'manipulation' }}
                      className={`w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none ${
                        detectedRestrictedArea
                          ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 bg-red-50/20"
                          : "border-gray-300 focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20"
                      }`}
                    />

                    {/* Real-time Restricted Delivery Area Alert (Shows instantly when outside Dhaka division/city entered) */}
                    {detectedRestrictedArea && (
                      <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100/70 border-2 border-red-500 text-red-950 p-3 sm:p-4 rounded-2xl text-xs shadow-md mt-2 space-y-2 animate-fadeIn ring-2 ring-red-400/20">
                        <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                          <span className="text-xl sm:text-2xl flex-shrink-0 animate-bounce">🚫</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-black text-red-700 text-xs sm:text-sm block tracking-tight">
                              এই ঠিকানায় ডেলিভারি সেবা উপলব্ধ নেই!
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-red-600 block">
                              Delivery Not Available to this Location
                            </span>
                          </div>
                          <span className="text-[9.5px] sm:text-[11px] font-black bg-red-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs flex-shrink-0">
                            {detectedRestrictedArea.divisionBn}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-0.5">
                          <p className="font-extrabold text-[#7A1C1C] text-xs sm:text-[13px] leading-snug">
                            দুঃখিত! <strong>"{detectedRestrictedArea.matchedWord}"</strong> ({detectedRestrictedArea.divisionBn}) ঠিকানায় এই অর্ডারটি ডেলিভারি করা সম্ভব নয়।
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-800 font-semibold leading-relaxed">
                            ১০০% প্রিমিয়াম ডাবের পুডিংয়ের সর্বোচ্চ স্বাদ ও তাজা গুণমান বজায় রাখতে আমাদের হোম ডেলিভারি সেবা <strong>শুধুমাত্র ঢাকা সিটির ভেতরেই সীমাবদ্ধ</strong> (ঢাকার বাইরে কোনো ডেলিভারি সেবা উপলব্ধ নেই)।
                          </p>
                          <div className="bg-white/85 border border-red-200 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-[11px] text-red-900 font-medium italic">
                            Sorry! Delivery is available strictly inside Dhaka City only. We currently do not offer delivery to {detectedRestrictedArea.displayText}.
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] sm:text-[11px] font-black text-[#4A6741] pt-0.5">
                      ⚠️ অবশ্যই ফ্ল্যাট নম্বর উল্লেখ করবেন, যাতে ডেলিভারি পেতে সুবিধা হয়।
                    </p>
                  </div>

                  {/* Optional Email & Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="customer-email" className="text-xs sm:text-[11px] font-black text-gray-800 tracking-tight block">
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
                        style={{ touchAction: 'manipulation' }}
                        className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-medium text-gray-800 outline-none focus:border-[#4A6741] transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-note" className="text-xs sm:text-[11px] font-black text-gray-800 tracking-tight block">
                        বিশেষ নির্দেশনা (Note - ঐচ্ছিক):
                      </label>
                      <input
                        id="customer-note"
                        type="text"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        placeholder="ডেলিভারি সংক্রান্ত কিছু থাকলে..."
                        style={{ touchAction: 'manipulation' }}
                        className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-medium text-gray-800 outline-none focus:border-[#4A6741] transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
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

                {/* High-Converting Shopify-Style Call to Action Submit Button (Always visible for consecutive/multi-person orders) */}
                <div className="pt-0.5 space-y-3">
                  {orderPlaced && (
                    <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3.5 text-center space-y-1.5 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-bold">
                        আমাদের প্রতিনিধি দ্রুত আপনার সাথে ফোনে বা WhatsApp-এ যোগাযোগ করবেন। নতুন আরেকটি অর্ডার করতে চাইলে নিচের বাটনে চাপ দিন।
                      </p>
                    </div>
                  )}

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
                  <div className="bg-emerald-50/90 border border-[#4A6741]/20 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                      <strong>সংরক্ষণ পদ্ধতি:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে।
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </form>


      </div>

      <OrderSuccessPopup 
        isOpen={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          setOrderPlaced(false);
          submittingRef.current = false;
          setIsGift(false);
          setGiftMessage("");
        }} 
        customerName={submittedName} 
        isGift={isGift}
        giftMessage={giftMessage}
      />
    </section>
  );
};

export default Hero;
