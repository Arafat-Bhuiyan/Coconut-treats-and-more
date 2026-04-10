import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import productImg from "../../../../assets/images/coconuts-treats-more-hero.jpeg";

const Order = () => {
    const [quantity, setQuantity] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        note: "",
        agree: true
    });

    const basePrice = 600;
    const offerPrice = 570;
    const deliveryCharge = 80;

    const unitPrice = quantity >= 5 ? offerPrice : basePrice;
    const totalProductPrice = quantity * unitPrice;
    const totalOrderAmount = totalProductPrice + deliveryCharge;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOrder = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address) {
            alert("Please fill in Name, Phone, and Address");
            return;
        }

        const message = `*New Order from Website*
*Customer:* ${formData.name}
*Phone:* ${formData.phone}
*Address:* ${formData.address}
*Note:* ${formData.note || "N/A"}
-------------------------
*Item:* Premium Coconut Pudding (6pc Box)
*Quantity:* ${quantity} Box(es)
*Unit Price:* ৳${unitPrice}
*Product Total:* ৳${totalProductPrice}
*Delivery:* ৳${deliveryCharge}
*Total Amount:* ৳${totalOrderAmount}
-------------------------
_Please confirm my order!_`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/8801XXXXXXXXX?text=${encodedMessage}`, '_blank');
    };

    return (
        <section id="order" className="py-24 px-4 bg-[#f8fafc] overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-5 gap-12 items-start">

                    {/* Left Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-secondary/5 border border-secondary/5"
                    >
                        <h3 className="text-3xl font-extrabold text-husk mb-8 text-center lg:text-left">
                            Place Your Order
                        </h3>

                        <form onSubmit={handleOrder} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-husk/70 ml-1">Name</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-husk/70 ml-1">Mobile Number</label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    type="tel"
                                    placeholder="01XXX-XXXXXX"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-husk/70 ml-1">Full Address</label>
                                <textarea
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Your detailed delivery address"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none shadow-inner"
                                ></textarea>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* bKash Option */}
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Option 1: bKash Payment</p>
                                        <p className="text-xs text-husk/80 leading-relaxed font-bold">
                                            Send money to <span className="text-primary font-black">+8801618562844</span> (Personal).
                                            Write <span className="text-husk font-black">TrxID</span> & <span className="text-husk font-black">Number</span> in note.
                                        </p>
                                    </div>

                                    {/* COD Option */}
                                    <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20 flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-accent-dark uppercase tracking-widest mb-2">Option 2: Cash on Delivery</p>
                                        <p className="text-xs text-husk/80 leading-relaxed font-bold">
                                            If you prefer COD, simply write <span className="text-accent-dark font-black">"Cash on Delivery"</span> in the order note below.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-husk/70 ml-1">Order Note</label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter bKash number, Transaction ID, and any special instructions..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none shadow-inner"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="agree"
                                    checked={formData.agree}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                                <label htmlFor="terms" className="text-sm font-medium text-husk/70 cursor-pointer select-none">
                                    I agree with the <span className="text-primary hover:underline">Terms and Conditions</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-1 active:scale-[0.98]"
                            >
                                CONFIRM ORDER
                            </button>
                        </form>
                    </motion.div>

                    {/* Right Side: Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-secondary/5">
                            <h3 className="text-xl font-black text-husk mb-6 border-b pb-4">Your Order Summary</h3>

                            {/* Product Info Table-like Row */}
                            <div className="flex gap-4 items-center pb-6 border-b border-dashed">
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border">
                                    <img src={productImg} alt="Product" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-husk text-sm md:text-base leading-tight">
                                        Premium Coconut Pudding (6pc Box)
                                    </h4>
                                    <p className="text-xs font-bold text-primary mt-1">৳{unitPrice} / box</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-husk">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-1 hover:bg-white rounded-md transition-colors text-husk/50 hover:text-primary"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <p className="font-bold text-husk">৳{totalProductPrice}</p>
                                </div>
                            </div>

                            {/* Summary Totals */}
                            <div className="space-y-4 pt-6">
                                <div className="flex justify-between text-sm md:text-base font-medium text-husk/70">
                                    <span>Subtotal</span>
                                    <span>৳{totalProductPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm md:text-base font-medium text-husk/70">
                                    <span>Delivery Charge</span>
                                    <span>৳{deliveryCharge}</span>
                                </div>

                                {quantity >= 5 && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-accent/10 p-3 rounded-xl border border-accent/20 flex items-center justify-between"
                                    >
                                        <span className="text-xs font-black text-accent-dark flex items-center gap-2">
                                            <CheckCircle size={14} /> BULK OFFER APPLIED
                                        </span>
                                        <span className="text-xs font-bold text-accent-dark">- ৳{quantity * 30} Savings</span>
                                    </motion.div>
                                )}

                                <div className="flex justify-between text-xl font-black text-husk pt-4 border-t">
                                    <span>Order Amount</span>
                                    <span className="text-primary">৳{totalOrderAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Offer Badge */}
                        <div className="bg-primary p-6 rounded-[2rem] text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                                    <CheckCircle className="text-accent" />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 text-white">Buy More, Save More!</h4>
                                    <p className="text-sm text-white/90 leading-snug">
                                        Order 5 or more boxes to unlock the <span className="text-accent font-bold">৳570/box</span> offer. You're saving ৳30 per box!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Order;
