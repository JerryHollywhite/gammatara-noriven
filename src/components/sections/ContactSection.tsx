"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/Button";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

interface ContactSectionProps {
    address?: string;
    phone?: string;
    email?: string;
    siteContent?: Record<string, string>;
}

export default function ContactSection({ address, phone, email, siteContent = {} }: ContactSectionProps) {
    const form = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.current) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Extract form data
        const formData = new FormData(form.current);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsSubmitting(false);
                setSubmitStatus('success');
                if (form.current) form.current.reset();
                setTimeout(() => setSubmitStatus('idle'), 5000);
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Submission failed:', error);
            setIsSubmitting(false);
            setSubmitStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Contact Info & Copy */}
                    <div>
                        <span className="text-secondary font-bold tracking-widest uppercase text-xs">
                            {siteContent["Contact_Header_Label"] || "Get in Touch"}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-6">
                            {siteContent["Contact_Header_Title"] || "Ready to Unlock Your Child's Potential?"}
                        </h2>
                        <p className="text-lg text-slate-600 mb-8">
                            {siteContent["Contact_Header_Subtitle"] || "Book a free consultation or check class availability. We are here to answer all your questions about our programs and teaching methodology."}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{siteContent["Contact_Label_Address"] || "Visit Us"}</h4>
                                    <p className="text-slate-600">
                                        {address || "Ruko Cahaya Garden Blok AA No. 28-29, Kel. Sei Panas, Batam 29433."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 shrink-0">
                                    {/* WhatsApp Icon SVG */}
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-[#25D366] transition-colors">{siteContent["Contact_Label_Phone"] || "Call or WhatsApp"}</h4>
                                    <a
                                        href={`https://wa.me/${(phone || "6285117189988").replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-medium text-slate-600 hover:text-[#25D366] transition-colors flex items-center gap-2 mt-1"
                                    >
                                        {phone || "+62 851 1718 9988"}
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Chat Now</span>
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{siteContent["Contact_Label_Email"] || "Email Us"}</h4>
                                    <p className="text-slate-600">
                                        {email || "gammatara88@gmail.com"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6"> {siteContent["Contact_Form_Title"] || "Book a Consultation"}</h3>
                        <form ref={form} onSubmit={handleSubmit} className="space-y-4">
                            {/* Hidden fields typically used by EmailJS templates if they expect specific names */}
                            <input type="hidden" name="to_name" value="Gamma Tara Team" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="from_name" className="text-sm font-medium text-slate-700">{siteContent["Contact_Form_Label_StudentName"] || "Student Name"}</label>
                                    <input
                                        type="text"
                                        name="from_name" // Matching 'from_name' in legacy template
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="grade" className="text-sm font-medium text-slate-700">{siteContent["Contact_Form_Label_Grade"] || "Current Grade"}</label>
                                    <input
                                        type="text"
                                        name="grade"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                        placeholder="e.g. Grade 5"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="parent_name" className="text-sm font-medium text-slate-700">{siteContent["Contact_Form_Label_ParentName"] || "Parent's Name"}</label>
                                <input
                                    type="text"
                                    name="parent_name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                    placeholder="Enter parent's name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-slate-700">{siteContent["Contact_Form_Label_Phone"] || "WhatsApp / Phone"}</label>
                                <input
                                    type="tel"
                                    name="phone" // Matching 'phone' in legacy template
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                    placeholder="+62..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="program" className="text-sm font-medium text-slate-700">{siteContent["Contact_Form_Label_Program"] || "Program Interest"}</label>
                                <select name="program" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-slate-900">
                                    <option value="">Select a program...</option>
                                    <option value="kindergarten">Kindergarten</option>
                                    <option value="primary">Primary School</option>
                                    <option value="secondary">Secondary School</option>
                                    <option value="adult">Adult / Professional</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-slate-700">Message (Optional)</label>
                                <textarea
                                    name="message" // Matching 'message' in legacy template
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                    placeholder="Any specific questions?"
                                />
                            </div>

                            <Button className="w-full text-lg h-12 mt-2" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>Sending... <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>{siteContent["Contact_Form_Button_Label"] || "Send Message"} <Send className="ml-2 w-4 h-4" /></>
                                )}
                            </Button>

                            {submitStatus === 'success' && (
                                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                                    {siteContent["Contact_Form_Success_Message"] || "Message sent successfully! We will contact you shortly."}
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                                    Failed to send message. Please try WhatsApp instead.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
