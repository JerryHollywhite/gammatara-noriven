"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ParentBilling() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBilling();
    }, []);

    const fetchBilling = async () => {
        try {
            const res = await fetch('/api/parent/billing');
            const json = await res.json();
            if (json.success) setInvoices(json.invoices);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (invoiceId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('invoiceId', invoiceId);

        setUploadingId(invoiceId);
        try {
            const res = await fetch('/api/parent/billing/upload', {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (json.success) {
                alert("Proof uploaded successfully!");
                fetchBilling();
            } else {
                alert(json.error || "Upload failed");
            }
        } catch (e) {
            alert("Upload error");
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Tuition & Billing
            </h2>

            {loading ? (
                <div className="text-center py-8 text-slate-500">Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No outstanding invoices. Great job!</div>
            ) : (
                <div className="space-y-4">
                    {invoices.map(invoice => (
                        <div key={invoice.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800">{invoice.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                            ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">For: <span className="font-semibold">{invoice.student.user.name}</span></p>
                                    <p className="text-sm text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-900 mb-2">Rp {invoice.amount.toLocaleString()}</p>

                                    {invoice.status === 'UNPAID' && (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`file-${invoice.id}`}
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleUpload(invoice.id, e.target.files[0]);
                                                }}
                                            />
                                            <label
                                                htmlFor={`file-${invoice.id}`}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors
                                                    ${uploadingId === invoice.id ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                            >
                                                {uploadingId === invoice.id ? (
                                                    "Uploading..."
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" /> Upload Proof
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}

                                    {invoice.status === 'PENDING' && (
                                        <div className="text-sm text-amber-600 font-medium flex items-center justify-end gap-1">
                                            <Clock className="w-4 h-4" /> Awaiting Verification
                                        </div>
                                    )}

                                    {invoice.status === 'PAID' && (
                                        <div className="text-sm text-emerald-600 font-medium flex items-center justify-end gap-1">
                                            <CheckCircle className="w-4 h-4" /> Paid Successfully
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
