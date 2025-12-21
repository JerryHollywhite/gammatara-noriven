"use client";

import { Quote } from "lucide-react";

const testimonials = [
    {
        content: "Belajar matematika bareng Ko Riven di Gamma Tara benar-benar pengalaman yang seru dan menyenangkan! Penjelasannya jelas, mudah dipahami, dan cara mengajarnya bikin konsep yang sulit jadi terasa simpel. Pokoknya, matematika jadi lebih menarik dan nggak membosankan. Best tutor ever!",
        author: "Chelsy Kho",
        role: "Alumni",
    },
    {
        content: "Bimbel ini sangat membantu saya dengan mata pelajaran yang saya kurang kuasai sebelumnya. Dengan guru yang friendly dan antusias dalam mengajar serta lingkungan yang nyaman, saya bisa fokus belajar dan merasa termotivasi. Terima kasih Ko Riven dan para tutor untuk bimbingannya.",
        author: "Valeron Tan",
        role: "Alumni",
    },
    {
        content: "Pengalaman belajar sama Ko Riven di Gamma Tara sangat fun & balance sih, kadang hrs serius belajarnya tpi di campur sama candaan jadi lebih fun. Teknik cara ngajarnya juga mudah di mengerti apalagi MATEMATIKA, jdi overall super recommended",
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
