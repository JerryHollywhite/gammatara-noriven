"use client";

import { Quote } from "lucide-react";

const testimonials = [
    {
        content: "Best tutor ever! Explanations are clear and simple. Concepts that were hard before became easy to understand.",
        author: "Chelsy Kho",
        role: "Alumni",
    },
    {
        content: "Very helpful for subjects I was weak in. The teachers are friendly and the environment is very supportive.",
        author: "Valeron Tan",
        role: "Alumni",
    },
    {
        content: "Super recommended. Learning is fun & balanced. I never felt stressed, yet my grades improved significantly.",
        author: "Nicole Gracia",
        role: "Alumni",
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-primary text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute left-0 bottom-0 w-96 h-96 bg-secondary rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                        Hear From Our Students
                    </h2>
                    <p className="text-blue-200 text-lg">
                        Real stories of growth and success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative hover:bg-white/15 transition-colors">
                            <Quote className="w-10 h-10 text-secondary mb-4 opacity-50" />
                            <p className="text-lg text-white mb-6 italic leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-amber-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{testimonial.author}</div>
                                    <div className="text-sm text-blue-200">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
