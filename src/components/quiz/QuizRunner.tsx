"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "@/types/tara";
import { CheckCircle, XCircle, ChevronRight, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import confetti from 'canvas-confetti';
import BadgeNotification from "../gamification/BadgeNotification";

interface QuizRunnerProps {
    lessonId: string;
    lessonTitle: string;
    questions: QuizQuestion[];
}

export default function QuizRunner({ lessonId, lessonTitle, questions }: QuizRunnerProps) {
    const [gameState, setGameState] = useState<"intro" | "playing" | "result">("intro");
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // valid: { QID: "A" }
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [earnedBadge, setEarnedBadge] = useState<any>(null);

    const currentQ = questions[currentQIndex];

    const handleStart = () => {
        setGameState("playing");
    };

    const handleAnswer = (optionKey: string) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionKey }));
    };

    const handleNext = async () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            // Finish
            await submitQuiz();
        }
    };

    const submitQuiz = async () => {
        setSubmitting(true);

        // Calculate Score
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });

        const finalScore = correctCount;
        setScore(finalScore);

        try {
            const res = await fetch("/api/student/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId,
                    score: finalScore,
                    totalQuestions: questions.length
                })
            });
            const json = await res.json();
            if (json.success) {
                setXpAwarded(json.xpAwarded || 0);
                if (json.passed) triggerConfetti();
                if (json.newBadge) {
                    setEarnedBadge(json.newBadge);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setGameState("result");
            setSubmitting(false);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    // --- RENDERERS ---

    if (gameState === "intro") {
        return (
            <div className="max-w-2xl mx-auto items-center justify-center flex flex-col min-h-[60vh] text-center p-6">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                    <Trophy className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{lessonTitle}</h1>
                <p className="text-slate-500 mb-8 max-w-md">
                    Test your knowledge! There are {questions.length} questions in this quiz.
                    Score at least 70% to pass and earn XP.
                </p>
                <button
                    onClick={handleStart}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 text-lg"
                >
                    Start Quiz <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (gameState === "result") {
        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 70;

        return (
            <div className="max-w-md mx-auto items-center justify-center flex flex-col min-h-[60vh] text-center p-6 relative">
                <BadgeNotification
                    badge={earnedBadge}
                    onClose={() => setEarnedBadge(null)}
                />

                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-8 ${passed ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'}`}
                >
                    <div>
                        <span className="text-3xl font-black block">{percentage}%</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{passed ? "Passed" : "Failed"}</span>
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {passed ? "Great Job!" : "Keep Trying!"}
                </h2>
                <p className="text-slate-500 mb-6">
                    You got {score} out of {questions.length} correct.
                    {xpAwarded > 0 && <span className="block mt-2 font-bold text-amber-500">+{xpAwarded} XP Earned!</span>}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                    <Link href="/modules" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20">
                        Back to Modules
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQIndex + 1} / {questions.length}</span>
                <div className="flex gap-1">
                    {questions.map((_, idx) => (
                        <div key={idx} className={`h-1.5 w-6 rounded-full transition-all ${idx <= currentQIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug">
                        {currentQ.questionText}
                    </h3>

                    <div className="space-y-3">
                        {Object.entries(currentQ.options || {}).map(([key, text]) => {
                            if (!text) return null;
                            const isSelected = answers[currentQ.id] === key;
                            return (
                                <div
                                    key={key}
                                    onClick={() => handleAnswer(key)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
                                        ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md ring-2 ring-indigo-200'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                                        ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600'}
                                    `}>
                                        {key}
                                    </span>
                                    <span className="font-medium text-lg">{text}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-10 flex justify-end">
                <button
                    disabled={!answers[currentQ.id] || submitting}
                    onClick={handleNext}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all transform active:scale-95"
                >
                    {submitting ? "Submitting..." : (currentQIndex === questions.length - 1 ? "Finish Quiz" : "Next Question")}
                    {!submitting && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
