"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, GraduationCap, School, Users } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<"STUDENT" | "TEACHER" | "PARENT" | "ADMIN">("STUDENT");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
                role,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                // Redirect based on selected role
                if (role === "STUDENT") window.location.href = "/student/dashboard";
                else if (role === "TEACHER") window.location.href = "/teacher/dashboard";
                else if (role === "PARENT") window.location.href = "/parent/dashboard";
                else if (role === "ADMIN") window.location.href = "/admin/analytics";
                else window.location.href = "/student/dashboard";
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

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
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-heading">
                    {role === "ADMIN" ? "Owner Access" : "Sign in to your account"}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Or{' '}
                    <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                        apply for access
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100 relative">
                    {/* Owner Login Link - Top Right */}
                    <div className="absolute top-4 right-4">
                        <button
                            type="button"
                            onClick={() => setRole(role === "ADMIN" ? "STUDENT" : "ADMIN")}
                            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {role === "ADMIN" ? "Login as User" : "Login Owner"}
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Role Selection - Hide if Admin */}
                        {role !== "ADMIN" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Login as
                                </label>
                                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setRole("STUDENT")}
                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-bold transition-all ${role === "STUDENT"
                                            ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            }`}
                                    >
                                        <GraduationCap className={`w-5 h-5 mb-1 ${role === "STUDENT" ? "text-indigo-600" : "text-slate-400"}`} />
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("TEACHER")}
                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-bold transition-all ${role === "TEACHER"
                                            ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            }`}
                                    >
                                        <School className={`w-5 h-5 mb-1 ${role === "TEACHER" ? "text-emerald-600" : "text-slate-400"}`} />
                                        Teacher
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("PARENT")}
                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-bold transition-all ${role === "PARENT"
                                            ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            }`}
                                    >
                                        <Users className={`w-5 h-5 mb-1 ${role === "PARENT" ? "text-orange-600" : "text-slate-400"}`} />
                                        Parent
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
