"use client";

import { Button } from "../ui/Button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactSection() {
    return (
        <section id="contact" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Contact Info & Copy */}
                    <div>
                        <span className="text-secondary font-bold tracking-widest uppercase text-xs">Get in Touch</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-6">
                            Ready to Unlock Your Child's Potential?
                        </h2>
                        <p className="text-lg text-slate-600 mb-8">
                            Book a free consultation or check class availability. We are here to answer all your questions about our programs and teaching methodology.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Visit Us</h4>
                                    <p className="text-slate-600">
                                        Ruko Cahaya Garden Blok AA No. 28-29,<br />Sei Panas, Batam.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Call or WhatsApp</h4>
                                    <p className="text-slate-600">+62 851 1718 8131</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Email Us</h4>
                                    <p className="text-slate-600">gammatara88@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Book a Consultation</h3>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Student Name</label>
                                    <input type="text" id="name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Enter name" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="grade" className="text-sm font-medium text-slate-700">Current Grade</label>
                                    <input type="text" id="grade" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Grade 5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="parentName" className="text-sm font-medium text-slate-700">Parent's Name</label>
                                <input type="text" id="parentName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Enter parent's name" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact" className="text-sm font-medium text-slate-700">WhatsApp / Phone</label>
                                <input type="tel" id="contact" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="+62..." />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="program" className="text-sm font-medium text-slate-700">Program Interest</label>
                                <select id="program" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                                    <option value="">Select a program...</option>
                                    <option value="kindergarten">Kindergarten</option>
                                    <option value="primary">Primary School</option>
                                    <option value="secondary">Secondary School</option>
                                    <option value="adult">Adult / Professional</option>
                                </select>
                            </div>

                            <Button className="w-full text-lg h-12 mt-2">
                                Send Message <Send className="ml-2 w-4 h-4" />
                            </Button>

                            <p className="text-xs text-center text-slate-500 mt-4">
                                We will contact you shortly to confirm your slot.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
