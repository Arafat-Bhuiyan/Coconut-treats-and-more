import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Ahmed",
        role: "Food Blogger",
        content: "Highest quality coconut pudding I've tried. The texture is incredibly smooth and just the right amount of sweetness.",
        image: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        name: "Fahim Rahman",
        role: "Fitness Coach",
        content: "Perfect guilt-free dessert. I love that they don't use any preservatives. Truly fresh and healthy!",
        image: "https://i.pravatar.cc/150?u=fahim"
    },
    {
        name: "Nusrat Jahan",
        role: "Busy Mom",
        content: "The packaging is beautiful and the pudding taste just like home. My kids love it as a healthy snack.",
        image: "https://i.pravatar.cc/150?u=nusrat"
    }
];

const Testimonials = () => {
    return (
        <section id="reviews" className="py-24 px-4 bg-secondary/5">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold text-husk mb-4">What Our Customers Say</h2>
                    <p className="text-husk/60">
                        Don't just take our word for it. Here's what pudding lovers have to say.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="bg-pure-coconut p-8 rounded-3xl border border-secondary/10 shadow-sm"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-accent text-accent" />
                                ))}
                            </div>
                            <p className="text-husk/80 italic mb-8 italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full ring-2 ring-primary/20" />
                                <div>
                                    <h4 className="font-bold text-husk">{testimonial.name}</h4>
                                    <p className="text-xs text-husk/50">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
