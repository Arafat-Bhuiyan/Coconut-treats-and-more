import React, { useRef, useEffect, useState, useMemo } from "react";
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
  Play,
  MessageCircle
} from "lucide-react";
import OrderSuccessPopup from "../Order/OrderSuccessPopup";
import VideoReelStrip from "./VideoReelStrip";
import { trackFacebookEvent, getMetaBrowserIds, getTrackingTestFlags, isTestOrderInput } from "../../../../utils/facebookTracking";
import { checkRestrictedDeliveryArea } from "../../../../utils/deliveryAreaCheck";

const REVIEW_IMAGES = Array.from({ length: 8 }, (_, i) => `/reviews/${i + 1}.webp`);

const Hero = () => {
  const submittingRef = useRef(false);
  const hasInitiatedCheckoutRef = useRef(false);
  const lastOrderRef = useRef({ phone: "", timestamp: 0 });
  const [orderPlaced, setOrderPlaced] = useState(false);
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
  const saveTimerRef = useRef(null);
  const reviewsSectionRef = useRef(null);
  const reviewsTrackRef = useRef(null);
  const detectedRestrictedArea = useMemo(
    () => checkRestrictedDeliveryArea(formData.address),
    [formData.address]
  );

  // Pause top reviews marquee when customer scrolls down to Order Form (0% GPU load during checkout)
  useEffect(() => {
    const sec = reviewsSectionRef.current;
    const trk = reviewsTrackRef.current;
    if (!sec || !trk || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        trk.style.animationPlayState = entries[0]?.isIntersecting ? "running" : "paused";
      },
      { threshold: 0.02 }
    );
    obs.observe(sec);
    return () => obs.disconnect();
  }, []);

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

  // Pricing calculations (1 Box = ৳750 with ৳50 delivery = ৳800, 2+ Boxes = ৳750/box with FREE DELIVERY)
  const basePrice = 750;
  const unitPrice = basePrice;
  const isFreeDelivery = selectedPkg >= 2;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const giftCharge = isGift ? 100 : 0;
  const totalProductPrice = selectedPkg * unitPrice;
  const grandTotalNumber = totalProductPrice + deliveryCharge + giftCharge;
  const grandTotal = `৳${grandTotalNumber.toLocaleString()}`;
  // 3+ Boxes: 60% Advance via bKash + 1.85% bKash Cashout Charge (Informational — submit still works so team can call!)
  const isAdvanceRequired = selectedPkg >= 3;
  const advanceBaseAmount = Math.round(grandTotalNumber * 0.6);
  const bkashCashoutCharge = Math.ceil(advanceBaseAmount * 0.0185);
  const totalBkashAdvance = advanceBaseAmount + bkashCashoutCharge;
  const dueOnDeliveryAmount = grandTotalNumber - advanceBaseAmount;
  const boxCountLabel = `${selectedPkg} ${selectedPkg === 1 ? "Box" : "Boxes"} (${selectedPkg * 6} Cups)`;
  const isPhoneValid = formData.phone.length === 11 && formData.phone.startsWith("01");

  // Auto-select bKash info panel when 3+ boxes selected (customer can still submit without TrxID)
  useEffect(() => {
    if (selectedPkg >= 3) {
      setPaymentMethod("bkash");
    }
  }, [selectedPkg]);

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

      if (typeof window !== "undefined" && window.ttq) {
        window.ttq.track("InitiateCheckout", {
          content_id: "coconut-pudding-6pc",
          content_name: "Premium Coconut Pudding (6pc Box)",
          content_type: "product",
          quantity: selectedPkg,
          value: grandTotalNumber,
          currency: "BDT"
        });
      }
    } catch {
      // Ignore tracking errors
    }
  };

  const scrollToCheckout = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Dismiss and prevent promo popup if customer explicitly clicks Order Now
    window.dispatchEvent(new CustomEvent("close-promo-popup"));
    try {
      sessionStorage.setItem("hasShownPromo", "true");
    } catch {
      // ignore
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
      // Debounced auto-save to localStorage (prevents synchronous eMMC write lag on budget Android phones)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
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
      }, 400);
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
    window.dispatchEvent(new CustomEvent("close-promo-popup"));
    // Dismiss mobile soft keyboard cleanly so error/success feedback is never hidden behind keyboard
    try {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } catch { /* ignore */ }
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

    const scrollAndFocusField = (fieldId) => {
      const el = document.getElementById(fieldId);
      if (el) {
        const navOffset = 110;
        const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        setTimeout(() => {
          try {
            el.focus({ preventScroll: true });
          } catch {
            el.focus();
          }
        }, 250);
      }
    };

    // Phone validation
    if (!rawPhone) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার মোবাইল নম্বর লিখুন।");
      scrollAndFocusField("customer-phone");
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
      scrollAndFocusField("customer-phone");
      return;
    }

    // Address validation
    if (!rawAddress) {
      submittingRef.current = false;
      setFormError("দয়া করে আপনার সম্পূর্ণ ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নম্বর) লিখুন।");
      scrollAndFocusField("customer-address");
      return;
    }

    // Restricted delivery area validation (Strictly blocked: Jatrabari, Demra, Jurain, Postogola, Shyampur, Keraniganj, Munshiganj, etc.)
    const restrictedMatch = checkRestrictedDeliveryArea(rawAddress);
    if (restrictedMatch) {
      submittingRef.current = false;
      setFormError(`🚫 দুঃখিত! ${restrictedMatch.matchedWord} (${restrictedMatch.displayText}) এলাকায় আমাদের ডেলিভারি সেবা উপলব্ধ নেই। আমাদের ডেলিভারি শুধুমাত্র ধানমন্ডি, গুলশান, বনানী, উত্তরা, মিরপুর, মোহাম্মদপুর, পুরান ঢাকাসহ ঢাকা সিটির মূল এলাকায় সীমাবদ্ধ।`);
      scrollAndFocusField("customer-address");
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
    setIsSubmitting(true);
    setFormError("");

    const fullAddress = rawAddress;
    const customerName = rawName || "Customer";
    const capturedPhone = standardPhone;
    const capturedName = rawName;
    const capturedEmail = rawEmail;
    const orderId = `ORD_${Date.now()}_${capturedPhone.slice(-4)}`;
    const { fbp, fbc } = getMetaBrowserIds();
    const { testEventCode } = getTrackingTestFlags();
    const isTestOrder = isTestOrderInput(rawNote, fullAddress, capturedName);

    const formattedPaymentNote = isAdvanceRequired
      ? `[3+ Box | 60% bKash Advance: ৳${advanceBaseAmount} + Cashout ৳${bkashCashoutCharge} = ৳${totalBkashAdvance} | Due COD (40%): ৳${dueOnDeliveryAmount} | TrxID: ${bkashTrx.trim() || "Pending (Call to confirm)"}]${rawNote ? ` | ${rawNote}` : ""}`
      : paymentMethod === "cod"
        ? (rawNote ? `[Cash on Delivery] ${rawNote}` : "Cash on Delivery")
        : `[bKash] TrxID/No: ${bkashTrx.trim() || "Not provided"}${rawNote ? ` | ${rawNote}` : ""}`;

    const giftNote = isGift
      ? ` | [🎁 GIFT CARD (+৳100) - Card Note: "${giftMessage.trim() || "শুভেচ্ছা রইলো"}"]`
      : "";
    const combinedNote = `${formattedPaymentNote}${giftNote}`;

    const emailPayload = {
      order_id: orderId,
      subject: `New Order${isGift ? " 🎁 [GIFT CARD +৳100]" : ""}: ${customerName}`,
      from_name: customerName,
      Customer: customerName,
      Phone: capturedPhone,
      Email: capturedEmail || "N/A",
      Address: fullAddress,
      Payment_Method: paymentMethod === "cod" ? "Cash on Delivery" : "bKash",
      Note: combinedNote,
      Product: `Premium Coconut Pudding (6pc Box)${isGift ? " 🎁 [গিফট কার্ড সহ (+৳100)]" : ""} - ${boxCountLabel}`,
      Quantity: `${selectedPkg} Box(es)`,
      Unit_Price: `৳${unitPrice}`,
      Product_Total: `৳${totalProductPrice}`,
      Delivery_Charge: `৳${deliveryCharge}`,
      Gift_Charge: isGift ? "৳100" : "৳0",
      Total_Amount: `৳${grandTotalNumber}`,
      meta_tracking: {
        fbp,
        fbc,
        value: grandTotalNumber,
        unit_price: unitPrice,
        num_items: selectedPkg,
        source_url: typeof window !== "undefined" ? window.location.href : "https://coconuttreatsmore.com/",
        is_test: isTestOrder,
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      },
    };

    // 1. FIRST save order reliably to /api/submit-order with automatic mobile 4G retry (same order_id = zero duplicates!)
    const postOrderWithRetry = async (maxAttempts = 2) => {
      let lastErr = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 11000) : null;
        try {
          const res = await fetch("/api/submit-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload),
            ...(controller ? { signal: controller.signal } : {}),
          });
          if (timer) clearTimeout(timer);

          let data = null;
          try {
            data = await res.json();
          } catch {
            data = null;
          }

          if (res.ok && data && data.success === true) {
            return { res, data };
          }
          // Do not retry 400 validation errors (e.g. outside-Dhaka restricted area)
          if (res.status === 400) {
            throw new Error(data?.message || "Invalid order details");
          }
          lastErr = new Error(data?.message || `HTTP ${res.status}`);
        } catch (err) {
          if (timer) clearTimeout(timer);
          if (err?.message && err.message.includes("ডেলিভারি করা সম্ভব নয়")) {
            throw err;
          }
          lastErr = err;
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 450));
        }
      }
      throw lastErr || new Error("Order submit failed");
    };

    try {
      await postOrderWithRetry(2);

      // 2. Order is CONFIRMED saved on server!
      // Skip ALL ad/analytics Purchase events if Note has 'TEST' or URL has ?test=1 (never pollute real ad data!)
      lastOrderRef.current = { phone: orderFingerprint, timestamp: Date.now() };

      if (!isTestOrder) {
        try {
          await trackFacebookEvent("Purchase", {
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
          }, {
            eventId: orderId,
            browserOnly: true, // Server CAPI Purchase already sent ONCE from /api/submit-order with same event_id=orderId
          });
        } catch (fbErr) {
          console.warn("FB Purchase event skipped:", fbErr);
        }

        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'purchase', {
              transaction_id: orderId,
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

        try {
          if (typeof window !== "undefined" && window.ttq) {
            window.ttq.track('CompletePayment', {
              content_id: 'coconut-pudding-6pc',
              content_type: 'product',
              content_name: 'Premium Coconut Pudding (6pc Box)',
              quantity: selectedPkg,
              price: unitPrice,
              value: grandTotalNumber,
              currency: 'BDT'
            });
            window.ttq.track('PlaceAnOrder', {
              content_id: 'coconut-pudding-6pc',
              content_type: 'product',
              content_name: 'Premium Coconut Pudding (6pc Box)',
              quantity: selectedPkg,
              price: unitPrice,
              value: grandTotalNumber,
              currency: 'BDT'
            });
          }
        } catch (ttErr) {
          console.warn("TikTok tracking error:", ttErr);
        }
      } else {
        console.info("[Tracking] Test order detected (Note has TEST or ?test=1) — skipped Meta Pixel, GA4 & TikTok Purchase.");
      }

      // 3. Only now show Success screen and reset form
      submittingRef.current = false;
      setIsSubmitting(false);
      setOrderPlaced(true);
      setSubmittedName(customerName);
      setShowSuccess(true);
      setHasSavedInfo(true);
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
    } catch (err) {
      console.error("Order submit failed:", err);
      submittingRef.current = false;
      setIsSubmitting(false);
      setOrderPlaced(false);
      setShowSuccess(false);
      const isAreaBlockedMsg = err?.message && err.message.includes("ডেলিভারি করা সম্ভব নয়");
      setFormError(
        isAreaBlockedMsg
          ? err.message
          : "অর্ডার পাঠানো যায়নি। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন অথবা নিচের WhatsApp বাটনে ক্লিক করে অর্ডার করুন।"
      );
    }
  };

  return (
    <section id="order" className="scroll-mt-20 pt-24 sm:pt-32 pb-4 sm:pb-8 px-3 sm:px-4 bg-[#F6F8F5]">
      <div className="container mx-auto max-w-5xl">
        


        {/* Unified 2-Column Shopify-Style Main Order Card */}
        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#4A6741]/15 overflow-hidden p-4 sm:p-7 md:p-9 space-y-4 md:space-y-6">
            
            {/* COMPACT EVENT & PARTY CATERING NOTICE (Green + Soft Golden Accent & Gentle GPU Blink) */}
            <div className="bg-gradient-to-r from-emerald-50 via-amber-100/90 to-emerald-50 border border-amber-400/90 rounded-xl px-3 py-1.5 text-center shadow-2xs">
              <style>
                {`
                  @keyframes gentleEventBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.68; }
                  }
                  .event-notice-blink {
                    animation: gentleEventBlink 2.2s ease-in-out infinite;
                  }
                `}
              </style>
              <p className="event-notice-blink text-[11px] sm:text-xs font-extrabold text-[#1E3A1A] leading-snug">
                ✨ <span className="text-amber-800">জন্মদিন, বিয়ে, গায়ে হলুদ, অফিস পার্টি</span> বা যে কোনো অনুষ্ঠানে ডেসার্ট হিসাবে আমাদের প্রিমিয়াম কোকোনাট পুডিং ডেলিভারি করা হয় ✨
              </p>
            </div>

            {/* TOP CUSTOMER REVIEWS MARQUEE (Auto-pauses when scrolled to Order Form) */}
            <div ref={reviewsSectionRef} id="reviews" style={{ contain: "layout style paint" }} className="scroll-mt-24 overflow-hidden relative -mx-1 sm:-mx-2 pb-1">
              <style>
                {`
                  @keyframes scrollHeroReviews {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-50%, 0, 0); }
                  }
                  .hero-reviews-marquee {
                    display: flex;
                    width: max-content;
                    animation: scrollHeroReviews 20s linear infinite;
                  }
                  .hero-reviews-marquee:hover {
                    animation-play-state: paused;
                  }
                `}
              </style>
              <div className="text-center mb-2.5 sm:mb-3.5">
                <h2 className="text-xl sm:text-3xl font-black text-[#1F291E] tracking-tight leading-tight">
                  Happy Customers Review
                </h2>
                <p className="text-[#1F291E]/60 text-[11px] sm:text-sm font-medium mt-0.5">
                  We&apos;re grateful for all the love we receive on social media!
                </p>
              </div>
              <div className="relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-6 sm:w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-6 sm:w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                <div className="flex overflow-hidden select-none gap-3.5 sm:gap-5 py-1">
                  <div ref={reviewsTrackRef} className="hero-reviews-marquee gap-3.5 sm:gap-5 min-w-full">
                    {REVIEW_IMAGES.map((img, idx) => (
                      <div key={`hr-orig-${idx}`} className="flex-none w-[185px] sm:w-[235px] md:w-[260px] rounded-2xl overflow-hidden border border-[#4A6741]/20 shadow-sm bg-[#F8FAF7]">
                        <img src={img} alt={`Customer Review ${idx + 1}`} className="w-full h-auto object-cover pointer-events-none" loading="lazy" decoding="async" width={260} height={195} />
                      </div>
                    ))}
                    {REVIEW_IMAGES.map((img, idx) => (
                      <div key={`hr-dup-${idx}`} className="flex-none w-[185px] sm:w-[235px] md:w-[260px] rounded-2xl overflow-hidden border border-[#4A6741]/20 shadow-sm bg-[#F8FAF7]">
                        <img src={img} alt={`Customer Review Duplicate ${idx + 1}`} className="w-full h-auto object-cover pointer-events-none" loading="lazy" decoding="async" width={260} height={195} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ULTRA-SLIM HORIZONTAL PRICING & ORDER CTA BAR (Between Reviews & Video Strip) */}
            <div className="w-full bg-white border border-[#4A6741]/30 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2.5 text-center md:text-left leading-tight">
                <span className="text-sm sm:text-base font-black text-emerald-950 bg-amber-300 border-2 border-amber-500 px-3 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                  ⭐ ২ বক্স ১,৫০০৳ • ফ্রি ডেলিভারি! 🚚
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-gray-700 whitespace-nowrap">
                  ✅ ১ বক্স: ৳৭৫০ + ডেলিভারি ৳৫০ = ৳৮০০
                </span>
              </div>
              <a
                href="#order-form-details"
                onClick={(e) => {
                  if (e && typeof e.preventDefault === 'function') e.preventDefault();
                  scrollToCheckout(e);
                }}
                style={{ touchAction: 'manipulation' }}
                className="group relative w-full sm:w-auto overflow-hidden inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black py-1.5 sm:py-2 px-5 sm:px-6 rounded-lg border-b-[3px] border-emerald-800 shadow-md shadow-emerald-600/30 transition-all duration-200 cursor-pointer select-none text-center flex-shrink-0"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <ShoppingBag size={16} className="text-white flex-shrink-0" />
                <span className="text-sm sm:text-base tracking-wide">
                  অর্ডার করুন
                </span>
                <span className="text-xs sm:text-sm">👇</span>
              </a>
            </div>

            {/* ROW 1: Half-Height Ultra-Fast Landscape Video Strip + Pricing & 3D Order CTA */}
            <div className="space-y-4">
              <VideoReelStrip />
              <div className="w-full max-w-md mx-auto">

                {/* SMART QUICK ORDER BUTTON DIRECTLY UNDER VIDEO */}
                <div className="pt-2">
                  <div className="w-full flex flex-col gap-2.5 bg-white border-2 border-[#4A6741]/25 rounded-2xl p-3 sm:p-4 shadow-sm">
                    <div className="flex flex-col items-center gap-1.5 text-center leading-snug">
                      <span className="w-full text-base sm:text-lg font-black text-emerald-950 bg-amber-300 border-2 border-amber-500 px-3.5 py-1.5 rounded-xl shadow-xs">
                        ⭐ ২ বক্স ১,৫০০৳ — ডেলিভারি একদম ফ্রি! 🚚
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-700">
                        ✅ ১ বক্স: ৳৭৫০ + ডেলিভারি চার্জ ৳৫০ = ৳৮০০
                      </span>
                    </div>
                    <a
                      href="#order-form-details"
                      onClick={(e) => {
                        if (e && typeof e.preventDefault === 'function') e.preventDefault();
                        scrollToCheckout(e);
                      }}
                      style={{ touchAction: 'manipulation' }}
                      className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black py-3 px-6 rounded-xl border-b-4 border-emerald-800 shadow-lg shadow-emerald-600/35 transition-all duration-200 cursor-pointer select-none text-center"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      <ShoppingBag size={20} className="text-white flex-shrink-0" />
                      <span className="text-base sm:text-lg tracking-wide">
                        অর্ডার করুন
                      </span>
                      <span className="text-sm sm:text-base">👇</span>
                    </a>
                  </div>
                </div>
              </div>


            </div>



            {/* Delivery Schedule Notification Banner - COMPACT & CLEAR IN BENGALI */}
            <div id="order-form-details" className="scroll-mt-24 flex justify-center mb-2 px-1 w-full">
              <div className="w-full bg-amber-50 border border-amber-400 rounded-xl px-3 py-2 text-center shadow-xs flex items-center justify-center gap-2">
                <span className="text-lg sm:text-xl flex-shrink-0">🚚</span>
                <p className="text-xs sm:text-sm md:text-base font-black text-amber-950 leading-snug">
                  ডেলিভারি শিডিউল: <span className="text-emerald-900 font-black">আজকে অর্ডার করলে ১–২ দিনের মধ্যে ডেলিভারি পাবেন</span>
                </p>
              </div>
            </div>



            {/* CHECKOUT ROW: Column 1 (Order Summary) | Column 2 (Delivery Details + Payment + Confirm Order) */}
            <div id="checkout-grid-container" className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              
              {/* COLUMN 1: Order Summary Card with 1-Tap 1 Box / 2 Boxes Quick Selector */}
              <div className="md:col-span-6 space-y-3">
                {/* 1. ORDER SUMMARY CARD */}
                <div className="bg-white rounded-2xl p-3.5 sm:p-5 border-2 border-[#4A6741]/40 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs sm:text-sm font-black text-[#1F291E] uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag size={15} className="text-[#4A6741]" />
                      <span>প্যাকেজ সিলেক্ট করুন (Order Summary)</span>
                    </span>
                    <span className="text-[11px] font-black text-[#4A6741] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {boxCountLabel}
                    </span>
                  </div>

                  {/* 1-TAP PACKAGE SELECTOR (Eliminates ৳1,500 sticker shock for first-time 1-box buyers!) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPkg(1)}
                      style={{ touchAction: 'manipulation' }}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer select-none ${
                        selectedPkg === 1
                          ? "bg-emerald-50 border-[#4A6741] ring-2 ring-[#4A6741]/20 shadow-xs"
                          : "bg-slate-50/80 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#1F291E]">১ বক্স (৬ কাপ)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          selectedPkg === 1 ? "border-[#4A6741] bg-[#4A6741]" : "border-gray-400"
                        }`}>
                          {selectedPkg === 1 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-sm font-black text-[#4A6741] mt-0.5">৳৭৫০</p>
                      <p className="text-[10px] text-gray-600 font-bold">+ ৳৫০ ডেলিভারি = ৳৮০০</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPkg(2)}
                      style={{ touchAction: 'manipulation' }}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer select-none relative overflow-hidden ${
                        selectedPkg >= 2
                          ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/35 shadow-sm"
                          : "bg-amber-50/60 border-amber-400 hover:border-amber-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-emerald-950">⭐ ২ বক্স (১২ কাপ)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          selectedPkg >= 2 ? "border-emerald-700 bg-emerald-700" : "border-gray-400"
                        }`}>
                          {selectedPkg >= 2 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-black text-emerald-800 leading-tight mt-0.5">১,৫০০৳</p>
                      <p className="text-[11px] text-emerald-800 font-black">🚚 ডেলিভারি একদম ফ্রি!</p>
                    </button>
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
                                value: nextPkg * basePrice,
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
                                value: nextPkg * basePrice,
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
                  <div className="space-y-2.5 pt-0.5">
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-600 uppercase">
                      <span>সাবটোটাল</span>
                      <span className="font-bold text-[#1F291E]">৳{totalProductPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700 uppercase">
                      <span>ডেলিভারি চার্জ</span>
                      {isFreeDelivery ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs sm:text-sm shadow-xs">
                          <span>🚚</span>
                          <span>ফ্রি (FREE DELIVERY)</span>
                        </span>
                      ) : (
                        <span className="font-bold text-[#1F291E]">৳{deliveryCharge}</span>
                      )}
                    </div>

                    {isGift && (
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-amber-900 uppercase bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-300">
                        <span className="flex items-center gap-1.5">
                          <span>🎁</span> স্পেশাল গিফট কার্ড
                        </span>
                        <span className="font-black text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-300 text-xs shadow-xs">
                          + ৳১০০
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-lg sm:text-xl font-black text-[#1F291E] pt-3 border-t border-dashed border-gray-300">
                      <span className="uppercase text-xs sm:text-sm font-black">সর্বমোট (TOTAL)</span>
                      <span className="text-[#4A6741] text-xl sm:text-2xl font-black">
                        {grandTotal}
                      </span>
                    </div>

                    {/* 3+ BOXES: 60% bKash Advance + 1.85% Cashout Charge Info Card */}
                    {isAdvanceRequired && (
                      <div className="bg-pink-50/90 border-2 border-[#D12053]/35 rounded-xl p-3 space-y-1.5 text-xs shadow-2xs">
                        <p className="font-black text-[#D12053] flex items-center gap-1.5 text-xs">
                          <span>📢</span>
                          <span>৩ বা ততোধিক বক্সের অর্ডারে ৬০% অগ্রিম বিকাশ প্রযোজ্য</span>
                        </p>
                        <div className="space-y-1 text-[11px] sm:text-xs font-bold text-gray-800 pt-0.5">
                          <div className="flex justify-between">
                            <span>৬০% অগ্রিম + ক্যাশআউট চার্জ (১.৮৫%):</span>
                            <span className="text-[#D12053] font-black">
                              ৳{advanceBaseAmount.toLocaleString()} + ৳{bkashCashoutCharge} = ৳{totalBkashAdvance.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>বাকি ৪০% ডেলিভারির সময় (COD):</span>
                            <span className="text-emerald-800 font-black">৳{dueOnDeliveryAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-[10.5px] font-bold text-gray-600 pt-1 border-t border-[#D12053]/15">
                          📞 এখনই টাকা না পাঠিয়েও অর্ডার কনফার্ম করতে পারবেন—আমাদের প্রতিনিধি কল করে পেমেন্ট ও ডেলিভারি নিশ্চিত করবেন।
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Delivery Details Form (Top) + Payment Method + Confirm Order + Storage Tip (Bottom) */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#4A6741]/40 shadow-sm space-y-3.5">
                  <div className="border-b border-gray-100 pb-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
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
                    <p className="text-[11px] sm:text-xs font-extrabold text-[#2B4C23] bg-emerald-50 border border-[#4A6741]/25 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                      <span>🚚</span>
                      <span>শুধুমাত্র ঢাকা মেট্রোপলিটন এরিয়াতে ডেলিভারি করা হয়।</span>
                    </p>
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
                        ঢাকা সিটি (Dhaka City Only)
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
                      className="w-full bg-white border-2 border-gray-300 focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none"
                    />

                    {/* Clear Restricted Delivery Alert (Explaining why delivery is not possible) */}
                    {detectedRestrictedArea && (
                      <div className="bg-rose-50 border-2 border-rose-400 text-rose-950 p-3 rounded-2xl text-xs shadow-sm mt-1.5 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-rose-200 pb-1.5">
                          <span className="text-base flex-shrink-0">🚫</span>
                          <span className="font-black text-rose-800 text-xs sm:text-sm">
                            এই এলাকায় ডেলিভারি সেবা উপলব্ধ নেই ({detectedRestrictedArea.divisionBn})
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-900 leading-snug font-semibold">
                          দুঃখিত! <strong>"{detectedRestrictedArea.matchedWord}"</strong> এলাকায় আমাদের ডেলিভারি সেবা চালু নেই। ফ্রেশ ডাবের পুডিং ডেলিভারি শুধুমাত্র ধানমন্ডি, গুলশান, বনানী, উত্তরা, মিরপুর, মোহাম্মদপুর, পুরান ঢাকাসহ ঢাকা সিটির মূল এলাকায় সীমাবদ্ধ।
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] sm:text-[11px] font-black text-[#4A6741] pt-0.5">
                      ⚠️ অবশ্যই ফ্ল্যাট নম্বর উল্লেখ করবেন, যাতে ডেলিভারি পেতে সুবিধা হয়।
                    </p>
                  </div>

                  {/* Optional Note (Email removed for simplified 3-click ordering) */}
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

                {/* 2. PAYMENT METHOD SELECTOR (Directly below Delivery Details & above Confirm Order!) */}
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
                        {isAdvanceRequired ? (
                          <>
                            <p>
                              2. ৬০% অগ্রিম: <strong className="text-[#D12053] font-black">৳{advanceBaseAmount.toLocaleString()}</strong> + ক্যাশআউট চার্জ <strong className="text-gray-900 font-black">৳{bkashCashoutCharge}</strong> = মোট <strong className="text-[#D12053] font-black">৳{totalBkashAdvance.toLocaleString()}</strong> পাঠান। (বাকি <strong className="text-emerald-800 font-black">৳{dueOnDeliveryAmount.toLocaleString()}</strong> পণ্য পেয়ে দেবেন)।
                            </p>
                            <p>3. টাকা পাঠিয়ে নিচে TrxID দিন—অথবা এখনই টাকা না পাঠিয়েও অর্ডার কনফার্ম করতে পারবেন, পরে আমাদের প্রতিনিধি কল করে কনফার্ম করবেন।</p>
                          </>
                        ) : (
                          <>
                            <p>2. মোট টাকা: <strong className="text-gray-900 font-black">{grandTotal}</strong> (ক্যাশ আউট খরচ সহ প্রযোজ্য)।</p>
                            <p>3. টাকা পাঠানোর পর TrxID বা আপনার বিকাশ নম্বর নিচের বক্সে লিখে অর্ডার কনফার্ম করুন।</p>
                          </>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="bkash-trx" className="text-[11px] font-black text-[#D12053] uppercase block">
                          বিকাশ TrxID বা যে নম্বর থেকে টাকা পাঠিয়েছেন {isAdvanceRequired ? "(ঐচ্ছিক — পরে কল করেও কনফার্ম করা যাবে)" : ""}:
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

                  {/* Big Bold Green Confirm Order Button (Clean Non-Wrapping Mobile Layout) */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full relative group overflow-hidden bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-3.5 sm:p-5 rounded-2xl border-b-4 border-emerald-800 shadow-xl shadow-emerald-600/35 flex items-center justify-between gap-2 transition-all cursor-pointer select-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {/* Shiny sweep reflection */}
                    <span className="pointer-events-none absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />

                    <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="block text-base sm:text-xl font-black tracking-tight leading-tight whitespace-nowrap">
                          {isSubmitting ? "অর্ডার প্রক্রিয়াধীন..." : "অর্ডার কনফার্ম করুন"}
                        </span>
                        <span className="block text-[10.5px] sm:text-[11px] font-semibold text-emerald-100 truncate">
                          {paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা)" : "বিকাশ পেমেন্ট • সম্পন্ন করুন"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-1.5 relative z-10 flex-shrink-0">
                      <div>
                        <span className="text-base sm:text-2xl font-black block leading-tight whitespace-nowrap">{grandTotal}</span>
                        <span className="text-[9.5px] sm:text-[10px] text-emerald-100 font-bold block whitespace-nowrap">
                          {isFreeDelivery ? "FREE DELIVERY 🚚" : "ডেলিভারি সহ"}
                        </span>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </button>

                  {/* WhatsApp 1-Click Order Button (Item 3) */}
                  <a
                    href={`https://wa.me/8801618562844?text=${encodeURIComponent(`আমি ${selectedPkg} বক্স ডাবের পুডিং অর্ডার করতে চাই`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackFacebookEvent("Contact", { content_name: "WhatsApp 1-Click Order Clicked" })}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa4e] text-white font-black text-sm sm:text-base py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/25 select-none transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center"
                  >
                    <MessageCircle size={22} className="flex-shrink-0" />
                    <span>🟢 ওয়েবসাইটে সমস্যা হলে হোয়াটসঅ্যাপে ১-ক্লিকে অর্ডার করুন</span>
                  </a>

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
