"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertOctagon } from "lucide-react";

interface ExamRunnerProps {
    examId: string;
    onComplete: (score: number) => void;
}

export default function ExamRunner({ examId, onComplete }: ExamRunnerProps) {
    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: answer }
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        if (!examId) return;

        fetch(`/api/student/exams/${examId}`)
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setExam(json.exam);
                    setTimeLeft(json.exam.durationMinutes * 60);
                } else {
                    alert("Failed to load exam: " + json.error);
                }
            })
            .catch(e => alert("Error loading exam"));
    }, [examId]);

    // TIMER LOGIC
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            submitExam();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => (prev ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleSelectOption = (questionId: string, option: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const submitExam = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const res = await fetch('/api/student/exams/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId,
                    answers
                })
            });

            const json = await res.json();
            if (json.success) {
                onComplete(json.score);
            } else {
                alert("Submission failed: " + json.error);
                setSubmitting(false);
            }
        } catch (e) {
            alert("Network error submitting exam");
            setSubmitting(false);
        }
    };

    if (!exam) return <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">Loading Exam...</div>;

    const currentQuestion = exam.questions[currentQ];

    return (
        <div className="fixed inset-0 bg-slate-50 z-[60] flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                <div>
                    <h1 className="font-bold text-lg">{exam.title}</h1>
                    <p className="text-xs text-slate-400">Question {currentQ + 1} of {exam.questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft && timeLeft < 300 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-amber-400'}`}>
                    <Clock className="w-5 h-5" />
                    {timeLeft ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : "--:--"}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
                                {currentQuestion.questionText}
                            </h2>

                            <div className="space-y-4">
                                {currentQuestion.options.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectOption(currentQuestion.id, opt)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group
                                            ${answers[currentQuestion.id] === opt
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md transform scale-[1.01]'
                                                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                                            ${answers[currentQuestion.id] === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                            {['A', 'B', 'C', 'D'][idx]}
                                        </div>
                                        <span className="font-medium text-lg">{opt}</span>
                                        {answers[currentQuestion.id] === opt && <CheckCircle className="w-6 h-6 text-indigo-600 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Sidebar (Desktop) */}
                <div className="hidden lg:block w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Question Map</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {exam.questions.map((q: any, i: number) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQ(i)}
                                className={`h-10 rounded-lg font-bold text-sm transition-colors border
                                    ${i === currentQ ? 'ring-2 ring-indigo-500 border-transparent' : ''}
                                    ${answers[q.id] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'}
                                `}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-200 p-4 md:px-8 absolute bottom-0 w-full flex justify-between items-center z-20">
                <button
                    disabled={currentQ === 0}
                    onClick={() => setCurrentQ(prev => prev - 1)}
                    className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    Previous
                </button>

                <div className="flex gap-4">
                    {currentQ < exam.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQ(prev => prev + 1)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button
                            onClick={submitExam}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1 flex items-center gap-2"
                        >
                            {submitting ? "Submitting..." : "Submit Exam"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


