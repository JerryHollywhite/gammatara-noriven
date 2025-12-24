"use client";

import { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";

export default function FinanceDashboard() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newInvoice, setNewInvoice] = useState({
        studentId: "",
        title: "",
        amount: "",
        dueDate: ""
    });

    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/admin/finance/invoices');
            const json = await res.json();
            if (json.success) setInvoices(json.invoices);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/finance/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInvoice)
            });
            const json = await res.json();
            if (json.success) {
                alert("Invoice Created!");
                setShowCreateModal(false);
                fetchInvoices();
            } else {
                alert("Failed: " + json.error);
            }
        } catch (e) {
            alert("Error creating invoice");
        }
    };

    const verifyPayment = async (invoiceId: string) => {
        if (!confirm("Confirm payment verification?")) return;
        setProcessingId(invoiceId);
        try {
            // Needed: API endpoint for verification (e.g. PATCH invoice status or PATCH payment)
            // For now, let's assume we implement a specific route or use the invoices route with PATCH
            // Implementing a new quick route for this: /api/admin/finance/invoices/[id]/verify
            const res = await fetch(`/api/admin/finance/invoices/${invoiceId}/verify`, { method: 'POST' });
            if (res.ok) {
                fetchInvoices();
            } else {
                alert("Failed to verify");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const totalRevenue = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);

    const pendingAmount = invoices
        .filter(i => i.status === 'PENDING' || i.status === 'UNPAID')
        .reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Financial Operations</h2>
                    <p className="text-slate-500">Manage tuition, invoices, and revenue.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                    + Create Invoice
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-500 font-bold">Total Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">Rp {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-500 font-bold">Pending / Unpaid</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">Rp {pendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-500 font-bold">Invoices Sent</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{invoices.length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 overflow-hidden">
                <h3 className="font-bold text-lg text-slate-800 mb-6">Recent Invoices</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {invoice.student?.user?.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{invoice.title}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">Rp {invoice.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        {invoice.status === 'PENDING' && (
                                            <button
                                                onClick={() => verifyPayment(invoice.id)}
                                                disabled={processingId === invoice.id}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                                            >
                                                {processingId === invoice.id ? "Verifying..." : "Verify Payment"}
                                            </button>
                                        )}
                                        {invoice.payment?.proofUrl && (
                                            <a href={invoice.payment.proofUrl} target="_blank" className="block text-xs text-blue-500 hover:underline mt-1">View Proof</a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Create New Invoice</h3>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Student ID (Profile ID)</label>
                                {/* In real app, search/dropdown student */}
                                <input
                                    className="w-full border p-2 rounded-xl"
                                    value={newInvoice.studentId}
                                    onChange={e => setNewInvoice({ ...newInvoice, studentId: e.target.value })}
                                    placeholder="Enter Student Profile ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input
                                    className="w-full border p-2 rounded-xl"
                                    value={newInvoice.title}
                                    onChange={e => setNewInvoice({ ...newInvoice, title: e.target.value })}
                                    placeholder="e.g. SPP January"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded-xl"
                                    value={newInvoice.amount}
                                    onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded-xl"
                                    value={newInvoice.dueDate}
                                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
