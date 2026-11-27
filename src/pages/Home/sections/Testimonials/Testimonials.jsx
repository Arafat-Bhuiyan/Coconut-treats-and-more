import { ShoppingBag, Star } from "lucide-react";

const Testimonials = () => {
    const scrollToCheckoutForm = (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const target = document.getElementById('order-form-details') || document.getElementById('order');
        if (target) {
            const navOffset = 90;
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
    };

    return (
        <section id="product-details" className="scroll-mt-24 pt-4 sm:pt-8 pb-16 sm:pb-24 overflow-hidden relative bg-[#F6F8F5]">
            {/* Product Details & Ingredients Section */}
            <div className="container mx-auto max-w-5xl px-4 sm:px-6">
                <div className="relative bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-[#4A6741]/20 shadow-md overflow-hidden">
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-[#4A6741] via-[#8DA47E] to-[#4A6741] h-2 w-full" />

                    <div className="space-y-5 text-left pt-2">
                        {/* Logo */}
                        <div>
                            <img
                                src="/logo.webp"
                                alt="Coconut Treats & More"
                                width={112}
                                height={112}
                                loading="lazy"
                                decoding="async"
                                className="w-24 sm:w-28 h-auto object-contain drop-shadow-sm"
                            />
                        </div>

                        {/* 100% Natural Ingredients Badge & 4.9/5 Gold Rating Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8DA47E]/20 text-[#4A6741] font-bold text-xs sm:text-sm">
                                100% Natural Ingredients
                            </span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300/80 shadow-2xs">
                                <div className="flex items-center text-amber-500 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className="fill-amber-400 text-amber-500" />
                                    ))}
                                </div>
                                <span className="text-xs font-black text-amber-950 tracking-tight">4.9 out of 5</span>
                                <span className="text-[11px] font-bold text-amber-800">• 1,000+ Customers</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#2C332A] leading-tight tracking-tight break-words">
                            Fresh Homemade <br className="sm:hidden" />
                            <span className="text-[#4A6741]">Premium Coconut Pudding</span>
                        </h2>

                        {/* 4 Feature Specification Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-1">
                            <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                                <span className="text-xl flex-shrink-0 mt-0.5">🥥</span>
                                <div className="space-y-0.5 leading-snug">
                                    <p className="text-xs sm:text-sm font-bold text-[#1F291E]">
                                        <strong className="text-[#3E6533]">টপ লেয়ার (Top Layer):</strong> রিফ্রেশিং ফ্রেশ ডাবের পানি ও নরম ডাবের মিষ্টি শাঁস এর পুডিং।
                                    </p>
                                    <p className="text-[10.5px] sm:text-xs text-gray-500 font-medium">
                                        Refreshing fresh green coconut water &amp; tender coconut chunks.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                                <span className="text-xl flex-shrink-0 mt-0.5">🥛</span>
                                <div className="space-y-0.5 leading-snug">
                                    <p className="text-xs sm:text-sm font-bold text-[#1F291E]">
                                        <strong className="text-[#3E6533]">বটম লেয়ার (Bottom Layer):</strong> খাঁটি গাভীর দুধের পুষ্টিকর, রিচ ও ক্রিমি সিল্কি পুডিং।
                                    </p>
                                    <p className="text-[10.5px] sm:text-xs text-gray-500 font-medium">
                                        Nutritious, rich, creamy &amp; velvety pure cow milk pudding.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                                <span className="text-xl flex-shrink-0 mt-0.5">📦</span>
                                <div className="space-y-0.5 leading-snug">
                                    <p className="text-xs sm:text-sm font-bold text-[#1F291E]">
                                        <strong className="text-[#3E6533]">প্যাক সাইজ (Pack Size):</strong> প্রতি বক্সে ৬ কাপ • প্রতিদিন সকালে টাটকা তৈরি।
                                    </p>
                                    <p className="text-[10.5px] sm:text-xs text-gray-500 font-medium">
                                        6 Cups per Box • Freshly handcrafted every morning.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#F8FAF7] border border-[#4A6741]/20 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                                <span className="text-xl flex-shrink-0 mt-0.5">❄️</span>
                                <div className="space-y-0.5 leading-snug">
                                    <p className="text-xs sm:text-sm font-bold text-[#1F291E]">
                                        <strong className="text-[#3E6533]">সংরক্ষণ (Storage):</strong> ৪–৫ দিন নরমাল ফ্রিজে রেখে স্বাচ্ছন্দ্যে উপভোগ করুন।
                                    </p>
                                    <p className="text-[10.5px] sm:text-xs text-gray-500 font-medium">
                                        Keeps 4–5 days fresh in standard refrigerator.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing + 3D Order Button & Happy Customers */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <div className="w-full sm:w-auto flex flex-col gap-2.5 bg-white border-2 border-[#4A6741]/25 rounded-2xl p-3 sm:p-3.5 shadow-sm">
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
                                    onClick={scrollToCheckoutForm}
                                    style={{ touchAction: 'manipulation' }}
                                    className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black py-3 px-6 rounded-xl border-b-4 border-emerald-800 shadow-lg shadow-emerald-600/35 transition-all duration-200 cursor-pointer select-none text-center"
                                >
                                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                                    <ShoppingBag size={20} className="text-white flex-shrink-0" />
                                    <span className="text-base sm:text-lg tracking-wide">অর্ডার করুন</span>
                                    <span className="text-sm sm:text-base">👆</span>
                                </a>
                            </div>

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
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
