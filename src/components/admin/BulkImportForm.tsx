"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ParsedLesson {
    subjectId: string;
    title: string;
    description?: string;
    videoDriveId?: string;
    order?: number;
}

export default function BulkImportForm() {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedLesson[]>([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());

            // Skip header row
            const dataLines = lines.slice(1);

            const lessons: ParsedLesson[] = dataLines.map(line => {
                const [subjectId, title, description, videoDriveId, order] = line.split(',').map(v => v.trim());
                return {
                    subjectId,
                    title,
                    description: description || undefined,
                    videoDriveId: videoDriveId || undefined,
                    order: order ? parseInt(order) : undefined
                };
            }).filter(lesson => lesson.subjectId && lesson.title);

            setParsedData(lessons);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        setImporting(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/content/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessons: parsedData })
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: 'Failed to import lessons'
            });
        } finally {
            setImporting(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setParsedData([]);
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-indigo-600" />
                    Bulk Content Import
                </h2>

                {/* File Upload */}
                {!parsedData.length && (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-600 font-bold mb-2">Upload CSV File</p>
                            <p className="text-sm text-slate-400">Format: subjectId,title,description,videoDriveId,order</p>
                        </label>
                    </div>
                )}

                {/* Preview Table */}
                {parsedData.length > 0 && !result && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-600">
                                <span className="font-bold">{parsedData.length}</span> lessons ready to import
                            </p>
                            <button
                                onClick={resetForm}
                                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-bold text-slate-700">Subject ID</th>
                                        <th className="p-3 text-left font-bold text-slate-700">Title</th>
                                        <th className="p-3 text-left font-bold text-slate-700">Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((lesson, idx) => (
                                        <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="p-3 text-slate-600">{lesson.subjectId}</td>
                                            <td className="p-3 text-slate-800 font-medium">{lesson.title}</td>
                                            <td className="p-3 text-slate-600">{lesson.order || 'Auto'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {importing ? 'Importing...' : 'Import Lessons'}
                        </button>
                    </div>
                )}

                {/* Result Summary */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className={`p-6 rounded-xl border-2 ${result.summary?.failed === 0
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-amber-50 border-amber-200'
                                }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {result.summary?.failed === 0 ? (
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-amber-600" />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">Import Complete</h3>
                                        <p className="text-sm text-slate-600">
                                            {result.summary?.succeeded} of {result.summary?.total} lessons imported successfully
                                        </p>
                                    </div>
                                </div>

                                {result.results?.errors?.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-bold text-sm text-red-700 mb-2">Errors:</p>
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {result.results.errors.map((err: any, idx: number) => (
                                                <p key={idx} className="text-xs text-red-600">
                                                    • {err.lesson}: {err.error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={resetForm}
                                className="w-full bg-slate-600 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                            >
                                Import Another File
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
