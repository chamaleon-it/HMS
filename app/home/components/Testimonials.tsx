import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "Synapse has completely transformed how we manage our OPD. The patient wait times have reduced by 40%, and the billing process is now error-free.",
        author: "Dr. Rajesh Kumar",
        role: "Medical Director, City Care Hospital",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop"
    },
    {
        quote: "The ABDM integration was a game-changer for us. Being able to link health records seamlessly has improved our patient care quality significantly.",
        author: "Dr. Priya Sharma",
        role: "Chief Administrator, Apollo Clinics",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop"
    },
    {
        quote: "Implementation was smooth and the support team is fantastic. The analytics dashboard gives me a clear view of my hospital's financial health.",
        author: "Mr. Suresh Reddy",
        role: "Operations Head, Sunshine Hospitals",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop"
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-black/30 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Trusted by <span className="text-secondary-glow">Healthcare Leaders</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Join hundreds of hospitals that are delivering better care with Synapse.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials?.map((item, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 p-8 rounded-2xl relative hover:bg-white/10 transition-colors">
                            <Quote className="w-10 h-10 text-[#3B82F6]/20 absolute top-6 right-6" />

                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                &quot;{item.quote}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={item.image}
                                    alt={item.author}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#3B82F6]/20"
                                />
                                <div>
                                    <div className="font-bold text-white">{item.author}</div>
                                    <div className="text-sm text-slate-500">{item.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
