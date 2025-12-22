"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, CheckCircle } from "lucide-react";
import Image from "next/image";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setStatus("error");
            setMessage("Invalid reset link.");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setStatus("loading");
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to reset password.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-slate-900">Password Reset Successful!</h3>
                <div className="mt-2 text-sm text-slate-500">
                    <p>Your password has been updated securely.</p>
                </div>
                <div className="mt-6">
                    <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
                Invalid or missing reset token. Please request a new link.
                <div className="mt-4">
                    <Link href="/forgot-password" className="text-sm font-medium underline">Request new link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-slate-900">Set New Password</h3>
                    <p className="text-sm text-slate-500">enter your new password below</p>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white"
                        />
                        <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="mt-1 relative">
                        <input
                            id="confirm"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white"
                        />
                        <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                {status === "error" && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex items-center justify-center mb-6 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="flex justify-center">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-2">
                        <Image
                            src="https://drive.google.com/thumbnail?id=1QwTFI0BxqAy2i74TzJb9RkR_dqUvQyIl&sz=s1000"
                            alt="Gamma Tara Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
