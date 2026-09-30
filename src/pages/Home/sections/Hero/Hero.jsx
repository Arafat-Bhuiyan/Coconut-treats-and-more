import React, { useRef, useEffect, useState } from "react";
import { ShoppingBag, ChevronRight, Check } from "lucide-react";

const Hero = () => {
  const videoRef = useRef(null);
  const [selectedPkg, setSelectedPkg] = useState(2); // Default: 2 Boxes

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleOrderClick = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Update order section quantity
    window.dispatchEvent(new CustomEvent("set-order-quantity", { detail: selectedPkg }));

    // Smooth scroll to order form
    const orderElement = document.getElementById("order");
    if (orderElement) {
      const navOffset = 80;
      const targetY = orderElement.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    } else {
      window.location.hash = "#order";
    }
  };

  // Pricing calculations
  const isOne = selectedPkg === 1;
  const isTwo = selectedPkg === 2;
  const isFive = selectedPkg === 5;

  const currentPrice = isOne ? "৳750" : isTwo ? "৳1,400" : "৳3,400";
  const oldPrice = isOne ? null : isTwo ? "৳1,500" : "৳3,750";
  const savingsText = isOne ? null : isTwo ? "-৳100 Saved" : "-৳350 + FREE DELIVERY";
  const deliveryText = isFive ? "FREE (৳0)" : "৳100";
  const grandTotal = isOne ? "৳850" : isTwo ? "৳1,500" : "৳3,400";
  const boxCountLabel = isOne ? "1 Box (6 Cups)" : isTwo ? "2 Boxes (12 Cups)" : "5 Boxes (30 Cups)";

  return (
    <section className="pt-28 sm:pt-36 pb-10 sm:pb-16 px-4 bg-[#F6F8F5]">
      <div className="container mx-auto max-w-5xl">
        
        {/* Desktop 2-Column / Mobile Stacked Container */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#4A6741]/15 overflow-hidden p-5 sm:p-8 md:p-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            
            {/* LEFT COLUMN: Showcase Video + Benefit Tiles */}
            <div className="md:col-span-6 space-y-4">
              
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

              {/* 3 Benefit Trust Badges (Hidden on mobile if stacked below, visible on desktop) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-[#F4F7F2] rounded-xl px-2 py-2.5 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                  <span className="w-4 h-4 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                  <span className="text-[11px] font-extrabold text-[#1F291E] leading-tight">No Preservatives</span>
                </div>
                <div className="bg-[#F4F7F2] rounded-xl px-2 py-2.5 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                  <span className="w-4 h-4 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                  <span className="text-[11px] font-extrabold text-[#1F291E] leading-tight">100% Halal</span>
                </div>
                <div className="bg-[#F4F7F2] rounded-xl px-2 py-2.5 flex items-center justify-center gap-1.5 border border-[#4A6741]/20 shadow-sm text-center">
                  <span className="w-4 h-4 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                  <span className="text-[11px] font-extrabold text-[#1F291E] leading-tight">Fresh Made Daily</span>
                </div>
              </div>

              {/* Desktop Storage Tip Placement */}
              <div className="hidden md:flex bg-emerald-50/80 border border-[#4A6741]/25 rounded-2xl p-4 items-start gap-3 shadow-sm">
                <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                  <strong>Storage Tip:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে। (Keep cups unboxed in normal fridge to maintain peak freshness).
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Title, Pricing & Shopify Custom Deals */}
            <div className="md:col-span-6 space-y-4">
              
              {/* Rating & Social Proof */}
              <div className="flex items-center gap-2 pt-1">
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

              {/* Interactive Package Bundle Selector (Ultra-Clear Premium Shopify DTC Style) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5">
                    <span>🏷️</span> SELECT BUNDLE &amp; SAVE:
                  </span>
                  <span className="text-xs font-black text-[#4A6741] bg-[#F4F7F2] px-3 py-1 rounded-full border border-[#4A6741]/25 shadow-sm">
                    {isFive ? "🎉 FREE DELIVERY!" : "🚚 Standard Delivery: ৳100"}
                  </span>
                </div>

                {/* 3 High-Contrast Segmented Package Cards */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {/* Package 1: 1 Box */}
                  <div 
                    onClick={() => setSelectedPkg(1)}
                    className={`package-card p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative shadow-sm ${
                      isOne 
                        ? "bg-emerald-50/80 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
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
                    <div className="my-1.5">
                      <span className="text-xl font-black text-[#1F291E]">৳750</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 block leading-tight">+ ৳100 Delivery</span>
                  </div>

                  {/* Package 2: 2 Boxes (Most Popular) */}
                  <div 
                    onClick={() => setSelectedPkg(2)}
                    className={`package-card p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative ${
                      isTwo 
                        ? "bg-emerald-50/80 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
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
                    <div className="my-1">
                      <span className="text-xs font-bold text-gray-400 line-through block leading-none">৳1,500</span>
                      <span className="text-2xl font-black text-[#4A6741] leading-tight">৳1,400</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#2E4A26] block leading-tight">+ ৳100 Delivery</span>
                  </div>

                  {/* Package 3: 5 Boxes (FREE DELIVERY) */}
                  <div 
                    onClick={() => setSelectedPkg(5)}
                    className={`package-card p-3 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative ${
                      isFive 
                        ? "bg-emerald-50/80 border-[#4A6741] shadow-lg ring-2 ring-[#4A6741]/25" 
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
                    <div className="my-1">
                      <span className="text-xs font-bold text-gray-400 line-through block leading-none">৳3,750</span>
                      <span className="text-2xl font-black text-[#4A6741] leading-tight">৳3,400</span>
                    </div>
                    <span className="text-[10px] font-black text-white bg-[#4A6741] rounded-full px-2 py-0.5 block shadow-sm uppercase tracking-wide">
                      FREE DELIVERY
                    </span>
                  </div>
                </div>
              </div>

              {/* Shopify Custom Deal: Unified Order Summary & Free Shipping Meter */}
              <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#4A6741]/20 shadow-sm space-y-3">
                {/* Free Shipping Meter */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#1F291E] mb-1.5">
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
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8DA47E] to-[#4A6741] rounded-full transition-all duration-300" 
                      style={{ width: isFive ? "100%" : isTwo ? "40%" : "20%" }}
                    />
                  </div>
                </div>

                {/* Breakdown Lines */}
                <div className="space-y-1.5 pt-2 border-t border-dashed border-[#4A6741]/20 text-xs">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Selected Package (<span className="font-bold text-[#1F291E]">{boxCountLabel}</span>):</span>
                    <div className="font-extrabold text-[#1F291E]">
                      {oldPrice && <span className="line-through text-gray-400 text-[11px] mr-1">{oldPrice}</span>}
                      <span className="text-sm font-black text-[#4A6741]">{currentPrice}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Delivery Charge (Dhaka City):</span>
                    <span className={`font-black ${isFive ? "text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full" : "text-[#4A6741]"}`}>
                      {deliveryText}
                    </span>
                  </div>
                  {savingsText && (
                    <div className="flex justify-between items-center text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-black text-[11px]">
                      <span>🎉 Bundle Discount Unlocked:</span>
                      <span>{savingsText}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#4A6741]/20">
                    <span className="text-sm font-black text-[#1F291E]">Total Payable:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#4A6741]">{grandTotal}</span>
                      <span className="text-[10px] text-gray-500 font-bold block">Cash on Delivery • bKash</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Converting Shopify-Style Call to Action Button (Directly Under Total Payable!) */}
              <div className="pt-1">
                <a 
                  href="#order"
                  onClick={handleOrderClick}
                  style={{ touchAction: 'manipulation' }}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4A6741] via-[#3E5837] to-[#31462A] hover:brightness-110 active:scale-[0.98] text-white p-4 rounded-2xl shadow-xl shadow-[#4A6741]/30 flex items-center justify-between transition-all cursor-pointer no-underline select-none"
                >
                  {/* Shiny light reflection sweep */}
                  <span className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-base sm:text-lg font-black tracking-wide leading-tight uppercase">ORDER NOW</span>
                      <span className="block text-[11px] font-semibold text-emerald-100/90">Cash on Delivery or bKash • Click to Order</span>
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
                </a>

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
                    <span className="text-[#4A6741]">🌿</span> Dhaka 24h Delivery
                  </span>
                </div>
              </div>

              {/* Mobile Storage Tip Note Box (Directly below Order Now button on mobile) */}
              <div className="md:hidden bg-emerald-50/80 border border-[#4A6741]/25 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-sm">
                <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-[#2B4025] font-bold leading-relaxed">
                  <strong>Storage Tip:</strong> বক্স থেকে খুলে কাপগুলো নরমাল ফ্রিজে রাখুন, এতে পুডিং দীর্ঘক্ষণ তাজা ও সুস্বাদু থাকবে। (Keep cups unboxed in normal fridge to maintain peak freshness).
                </p>
              </div>

              {/* Incentive / Unlocked Gift Ribbon */}
              <div className="bg-emerald-50 border-2 border-dashed border-[#8DA47E] rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-center">
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

      </div>
    </section>
  );
};

export default Hero;
