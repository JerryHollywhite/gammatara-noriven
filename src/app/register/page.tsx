"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Student",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-slate-900">Registration Successful!</h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500">
                                Your account has been created and is pending approval. You will be notified via email once an admin (Admin Bot) approves your request.
                            </p>
                        </div>
                        <div className="mt-6">
                            <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex items-center justify-center mb-6 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="flex justify-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                        <Image src="/logo.png" alt="Gamma Tara" fill className="object-cover" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-heading">
                    Create validation account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white" />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">WhatsApp / Phone</label>
                            <div className="mt-1">
                                <input id="phone" name="phone" type="text" required value={formData.phone} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white" />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">I am a...</label>
                            <div className="mt-1">
                                <select id="role" name="role" value={formData.role} onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Parent">Parent</option>
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white" />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <div className="mt-1">
                                <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white" />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
