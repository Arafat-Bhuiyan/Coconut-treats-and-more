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
  Plus,
  Minus,
  Sparkles
} from "lucide-react";
import OrderSuccessPopup from "../Order/OrderSuccessPopup";
import CountdownTimer from "../../../../components/CountdownTimer";
import { trackFacebookEvent } from "../../../../utils/facebookTracking";
import brandLogo from "../../../../assets/images/coconuts-treats-more-logo.webp";

// Restricted areas where fresh chilled pudding cannot be safely delivered
const RESTRICTED_AREAS = [
  { key: "savar", bn: "সাভার" },
  { key: "ashulia", bn: "আশুলিয়া", extra: ["asulia"] },
  { key: "keraniganj", bn: "কেরানীগঞ্জ", extra: ["keranigang", "keranigonj"] },
  { key: "narayanganj", bn: "নারায়ণগঞ্জ", extra: ["naraynganj", "narayangonj", "fatullah", "ফতুল্লা", "সিদ্ধিরগঞ্জ", "siddhirganj"] },
  { key: "munshiganj", bn: "মুন্সীগঞ্জ", extra: ["munshigang", "munshigonj"] },
  { key: "jatrabari", bn: "যাত্রাবাড়ী", extra: ["sayedabad", "সায়েদাবাদ"] },
  { key: "gazipur", bn: "গাজীপুর", extra: ["tongi", "টঙ্গী"] },
];

const OUTSIDE_DHAKA_DISTRICTS = [
  "chittagong", "চট্টগ্রাম", "sylhet", "সিলেট", "rajshahi", "রাজশাহী",
  "khulna", "খুলনা", "barisal", "বরিশাল", "rangpur", "রংপুর",
  "mymensingh", "ময়মনসিংহ", "comilla", "কুমিল্লা", "cox", "কক্সবাজার",
  "feni", "ফেনী", "noakhali", "নোয়াখালী", "bogura", "বগুড়া", "jashore", "যশোর", "kushtia", "কুষ্টিয়া"
];

const getRestrictedAreaMatch = (address) => {
  if (!address) return null;
  const lower = address.toLowerCase();

  for (const item of RESTRICTED_AREAS) {
    if (lower.includes(item.key) || address.includes(item.bn)) return item.bn;
    if (item.extra && item.extra.some((ex) => lower.includes(ex) || address.includes(ex))) return item.bn;
  }

  for (const city of OUTSIDE_DHAKA_DISTRICTS) {
    if (lower.includes(city) || address.includes(city)) return "ঢাকার বাইরে";
  }

  return null;
};

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
  const detectedRestrictedArea = getRestrictedAreaMatch(formData.address);

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

  // Pricing calculations (1 Box = ৳750, 2+ Boxes = ৳700/box with bulk discount, 5+ Boxes = Free Delivery)
  const basePrice = 750;
  const offerPrice = 700;
  const unitPrice = selectedPkg >= 2 ? offerPrice : basePrice;
  const isFreeDelivery = selectedPkg >= 5;
  const deliveryCharge = isFreeDelivery ? 0 : 100;
  const totalProductPrice = selectedPkg * unitPrice;
  const regularTotal = selectedPkg * basePrice;
  const discountAmount = regularTotal - totalProductPrice;
  const grandTotalNumber = totalProductPrice + deliveryCharge;
  const grandTotal = `৳${grandTotalNumber.toLocaleString()}`;
  const boxCountLabel = `${selectedPkg} ${selectedPkg === 1 ? "Box" : "Boxes"} (${selectedPkg * 6} Cups)`;
  const isPhoneValid = formData.phone.length === 11 && formData.phone.startsWith("01");

  // Emit package & price updates for the floating sticky order bar
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sticky-order-info", {
      detail: { selectedPkg, grandTotal }
    }));
  }, [selectedPkg, grandTotal]);

  const scrollToCheckout = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const formSection = document.getElementById("order-form-details");
    if (formSection) {
      const navOffset = 90;
      const targetY = formSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      const nameInput = document.getElementById("customer-name");
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 300);
      }
    }
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

    let nextVal = type === "checkbox" ? checked : value;
    if (name === "phone") {
      const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
      let clean = String(value).replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
      clean = clean.replace(/[^0-9+]/g, '');
      if (clean.startsWith('+88')) clean = clean.slice(3);
      else if (clean.startsWith('88')) clean = clean.slice(2);
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

    // Restricted delivery area validation (Method 1)
    const restrictedMatch = getRestrictedAreaMatch(formData.address);
    if (restrictedMatch) {
      submittingRef.current = false;
      setFormError(`দুঃখিত! ${restrictedMatch} এলাকায় ডাবের পুডিং ডেলিভারি সেবা বর্তমানে বন্ধ রয়েছে। ডেলিভারি শুধুমাত্র ঢাকা সিটির ভেতরে প্রযোজ্য।`);
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
            
            {/* ROW 1: Requested Day-1 Hero Layout (Left: Logo, Badge, Title, Description, Button, 500+ Happy Customers) + (Right: Video) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
              
              {/* ROW 1 LEFT: Logo, Title, Natural badge, Description and Order CTA (as in uploaded screenshot) */}
              <div className="md:col-span-6 space-y-5 text-left">
                {/* Logo */}
                <div>
                  <img 
                    src={brandLogo} 
                    alt="Coconut Treats & More" 
                    className="w-24 sm:w-32 h-auto object-contain drop-shadow-sm" 
                  />
                </div>

                {/* 100% Natural Ingredients Badge */}
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#8DA47E]/20 text-[#4A6741] font-bold text-xs sm:text-sm">
                    100% Natural Ingredients
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#2C332A] leading-tight tracking-tight break-words">
                  Fresh Homemade <br />
                  <span className="text-[#4A6741]">Premium Coconut Pudding</span>
                </h1>

                {/* Description & Layers */}
                <div className="space-y-4 max-w-lg text-left">
                  <p className="text-base sm:text-lg text-[#2C332A]/90 leading-relaxed font-medium">
                    Made with <span className="text-[#4A6741] font-bold">fresh coconut water</span>, <span className="text-[#4A6741] font-bold">authentic cow milk</span>, and <span className="text-[#4A6741] font-bold">imported agar-agar</span> jelly powder.
                  </p>
                  <div className="text-sm sm:text-base text-[#2C332A]/85 border-l-4 border-[#97BC62] pl-3.5 sm:pl-4 py-0.5 space-y-1.5">
                    <p><span className="font-bold text-[#2C332A]">Top layer:</span> Refreshing coconut water with coconut chunks (রিফ্রেশিং ফ্রেশ ডাবের পানি ও নরম ডাবের মিষ্টি শাঁস এর পুডিং)</p>
                    <p><span className="font-bold text-[#2C332A]">Bottom layer:</span> Rich, creamy cow milk.</p>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2C332A]/65 italic font-medium">
                    Creamy, refreshing dessert that melts in your mouth. Perfectly balanced sweetness for your healthy lifestyle.
                  </p>
                </div>

                {/* Button & 500+ happy customers */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <a
                    href="#order-form-details"
                    onClick={(e) => {
                      if (e && typeof e.preventDefault === 'function') e.preventDefault();
                      scrollToCheckout(e);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#4A6741] hover:bg-[#3E5837] active:scale-95 text-white font-extrabold py-3.5 px-6 sm:px-8 rounded-xl transition-all shadow-xl shadow-[#4A6741]/25 text-base sm:text-lg cursor-pointer select-none text-center"
                  >
                    <ShoppingBag size={20} />
                    <span>Order Now (কুইক অর্ডার)</span>
                  </a>

                  <div className="flex items-center gap-2.5 px-1">
                    <div className="flex -space-x-2">
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="customer 1" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="customer 2" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" alt="customer 3" />
                      <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" alt="customer 4" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#2C332A]/70">
                      <span className="text-[#4A6741] font-black">500+</span> happy customers
                    </p>
                  </div>
                </div>
              </div>

              {/* ROW 1 RIGHT: Product Video ("just dan dike video thakbe") */}
              <div className="md:col-span-6 space-y-4">
                {/* Video Card */}
                <div className="bg-[#F4F7F2] rounded-3xl p-3 relative flex flex-col justify-between overflow-hidden border border-[#4A6741]/20 shadow-md">
                  {/* Best Seller Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-[#4A6741] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
                      Best Seller
                    </span>
                  </div>

                  {/* Floating Badge (like the Day 1 screenshot) */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-[#8DA47E]/20 z-20">
                    <div className="bg-[#97BC62]/20 p-1.5 rounded-lg text-lg sm:text-xl">🥥</div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-semibold leading-tight">Made Fresh</p>
                      <p className="font-extrabold text-[#2C332A] text-xs sm:text-sm leading-tight">Every Morning</p>
                    </div>
                  </div>

                  {/* Video Container (Aspect 4:5 ensures full uncropped view of all pudding cups & box) */}
                  <div className="my-2 w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-md bg-[#243520] relative flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      autoPlay
                      loop 
                      muted 
                      playsInline
                      preload="auto"
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
                  <div className="text-center pt-1.5">
                    <span className="text-[11px] font-black text-[#4A6741] uppercase tracking-wider block">
                      6 Pieces Per Box • Fresh Made Daily
                    </span>
                  </div>
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

            {/* ROW 2: Delivery Details Form (Left) + Payment & Confirm Button (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* ROW 2 LEFT: Customer Info & Delivery Address Form (Auto-filled) */}
              <div className="md:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#4A6741]" />
                    <span>ডেলিভারি ঠিকানা ও তথ্য (Delivery Details)</span>
                  </span>
                  {hasSavedInfo && (
                    <button
                      type="button"
                      onClick={handleRestoreSavedInfo}
                      className="text-[10px] font-black text-[#4A6741] bg-emerald-50 hover:bg-emerald-100 border border-[#4A6741]/20 px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                      title="ক্লিক করে পূর্বের সংরক্ষিত তথ্য স্বয়ংক্রিয়ভাবে বসান"
                    >
                      <span>⚡ অটো ফিল</span>
                    </button>
                  )}
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
                    <div className="flex items-center justify-between">
                      <label htmlFor="customer-phone" className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
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
                        maxLength={11}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className={`w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
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
                    <label htmlFor="customer-address" className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
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
                    className={`w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none ${
                      detectedRestrictedArea
                        ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 bg-red-50/20"
                        : "border-gray-300 focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20"
                    }`}
                  />

                  {/* Real-time Restricted Delivery Area Alert */}
                  {detectedRestrictedArea && (
                    <div className="bg-red-50 border-2 border-red-400 text-red-800 p-2.5 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs mt-1 animate-fadeIn">
                      <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                      <div className="space-y-0.5">
                        <span className="font-black text-red-700 block text-xs">
                          দুঃখিত! {detectedRestrictedArea} এলাকায় আমাদের ডেলিভারি সার্ভিস বন্ধ রয়েছে।
                        </span>
                        <span className="text-[10px] text-gray-700 font-semibold block leading-tight">
                          ডাবের পুডিংয়ের সর্বোচ্চ স্বাদ ও তাজা গুণমান বজায় রাখতে ডেলিভারি শুধুমাত্র ঢাকা সিটির ভেতরে প্রযোজ্য (সাভার, আশুলিয়া, কেরানীগঞ্জ, নারায়ণগঞ্জ, মুন্সীগঞ্জ ও যাত্রাবাড়ী বাদে)।
                        </span>
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

              {/* ROW 2 RIGHT: Order Summary (Top) + Payment Method (Below) + Submit Button */}
              <div className="md:col-span-6 space-y-4">
                {/* 1. ORDER SUMMARY CARD (User Requested: Delivery Details er Dan Pashe) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
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
                          onClick={() => setSelectedPkg((prev) => Math.max(1, prev - 1))}
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
                          onClick={() => setSelectedPkg((prev) => Math.min(50, prev + 1))}
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

                    <div className="flex justify-between items-center text-lg sm:text-xl font-black text-[#1F291E] pt-3 border-t border-dashed border-gray-300">
                      <span className="uppercase text-xs sm:text-sm font-black">সর্বমোট (TOTAL)</span>
                      <span className="text-[#4A6741] text-xl sm:text-2xl font-black">
                        {grandTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT METHOD SELECTOR (UNDERNEATH ORDER SUMMARY) */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Banknote size={15} className="text-[#4A6741]" />
                    <span>মূল্য পরিশোধের মাধ্যম (PAYMENT METHOD):</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Cash on Delivery (Default Selected) */}
                    <div
                      id="payment-method-cod"
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
                      id="payment-method-bkash"
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
                  <div className="bg-emerald-50/90 border border-[#4A6741]/20 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                      <strong>সংরক্ষণ পদ্ধতি:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে।
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* ROW 3: Product Highlights Card (screnshort er likhata niche chole jabe) */}
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-2xl p-4 sm:p-6 space-y-3.5 text-xs sm:text-sm text-gray-700 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#4A6741]/15 pb-2.5 mb-1">
                  <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-2">
                    <span>🥥</span>
                    <span>ডাবের পুডিংয়ের বিশেষত্ব ও বিবরণ (Product Highlights)</span>
                  </span>
                  <span className="text-[10px] font-black text-[#4A6741] bg-emerald-50 border border-[#4A6741]/20 px-2.5 py-0.5 rounded-full">
                    100% Homemade & Fresh
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">🥥</span>
                    <div className="space-y-0.5 leading-relaxed">
                      <p>
                        <strong className="text-[#1F291E]">টপ লেয়ার (Top Layer):</strong> রিফ্রেশিং ফ্রেশ ডাবের পানি ও নরম ডাবের মিষ্টি শাঁস এর পুডিং।
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Refreshing fresh green coconut water & tender coconut chunks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">🥛</span>
                    <div className="space-y-0.5 leading-relaxed">
                      <p>
                        <strong className="text-[#1F291E]">বটম লেয়ার (Bottom Layer):</strong> খাঁটি গাভীর দুধের পুষ্টিকর, রিচ ও ক্রিমি সিল্কি পুডিং।
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Nutritious, rich, creamy & velvety pure cow milk pudding.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">📦</span>
                    <div className="space-y-0.5 leading-relaxed">
                      <p>
                        <strong className="text-[#1F291E]">প্যাক সাইজ (Pack Size):</strong> প্রতি বক্সে ৬ কাপ • প্রতিদিন সকালে টাটকা তৈরি।
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        6 Cups per Box • Freshly handcrafted every morning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-xl flex-shrink-0 mt-0.5">❄️</span>
                    <div className="space-y-0.5 leading-relaxed">
                      <p>
                        <strong className="text-[#1F291E]">সংরক্ষণ (Storage):</strong> ৪–৫ দিন নরমাল ফ্রিজে রেখে স্বাচ্ছন্দ্যে উপভোগ করুন।
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Keeps 4–5 days fresh in standard refrigerator.
                      </p>
                    </div>
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
