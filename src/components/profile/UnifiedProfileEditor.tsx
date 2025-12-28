"use client";

import { useState, useRef } from "react";
import { User, Phone, Lock, Camera, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileData {
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    role: string;
}

interface UnifiedProfileEditorProps {
    initialData: ProfileData;
    onSave?: () => void;
}

export default function UnifiedProfileEditor({ initialData, onSave }: UnifiedProfileEditorProps) {
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState<'INFO' | 'SECURITY'>('INFO');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password State
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

    // File Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: data.name, phone: data.phone })
            });
            const json = await res.json();
            if (json.success) setMessage({ type: 'success', text: "Profile updated successfully!" });
            else setMessage({ type: 'error', text: json.error || "Update failed" });
        } catch (err) {
            setMessage({ type: 'error', text: "Network error" });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: "New passwords do not match" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/profile/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });
            const json = await res.json();
            if (json.success) {
                setMessage({ type: 'success', text: "Password changed successfully!" });
                setPasswords({ current: "", new: "", confirm: "" });
            } else {
                setMessage({ type: 'error', text: json.error || "Password change failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Network error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/profile/upload-avatar", {
                method: "POST",
                body: formData
            });
            const json = await res.json();
            if (json.success) {
                setData(prev => ({ ...prev, image: json.url }));
                setMessage({ type: 'success', text: "Avatar updated!" });

                // Call onSave callback if provided, instead of reloading
                if (onSave) {
                    onSave();
                }
            } else {
                setMessage({ type: 'error', text: json.error || "Upload failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "Upload error" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
                    <div className="mb-6 text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3 group cursor-pointer">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={data.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.name}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera className="text-white w-8 h-8" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                        <h3 className="font-bold text-slate-800">{data.name}</h3>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{data.role}</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('INFO')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'INFO' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        <User className="w-4 h-4" /> Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'SECURITY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Lock className="w-4 h-4" /> Security
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 relative">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`absolute top-6 right-6 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                            >
                                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {activeTab === 'INFO' ? (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleInfoSubmit}
                            className="space-y-6 max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h2>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.phone || ""}
                                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                                        placeholder="+62..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 ml-1">Email cannot be changed.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handlePasswordSubmit}
                            className="space-y-6 max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Security Settings</h2>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Update Password
                            </button>
                        </motion.form>
                    )}
                </div>
            </div>
        </div>
    );
}
