"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Award, RefreshCcw } from "lucide-react";

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

interface QuizRunnerProps {
    title: string;
    questions: Question[];
    onComplete: (score: number) => void;
    onClose: () => void;
}

export default function QuizRunner({ title, questions, onComplete, onClose }: QuizRunnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === currentQuestion.correctIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            onComplete((score / questions.length) * 100);
        }
    };

    if (showResult) {
        const finalPercentage = Math.round((score / questions.length) * 100);
        return (
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-auto text-center shadow-xl border border-slate-100">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 mb-6">You scored</p>
                <div className="text-5xl font-bold text-primary mb-6">{finalPercentage}%</div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Correct</p>
                        <p className="text-xl font-bold text-green-600">{score}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Wrong</p>
                        <p className="text-xl font-bold text-red-500">{questions.length - score}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                        Back to Dashboard
                    </button>
                    <button onClick={() => {
                        setCurrentIndex(0);
                        setScore(0);
                        setShowResult(false);
                        setIsAnswered(false);
                        setSelectedOption(null);
                    }} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full mx-auto shadow-xl border border-slate-100 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quiz Mode</h3>
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                </div>
                <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            {/* Question */}
            <div className="mb-8 min-h-[120px]">
                <h3 className="text-lg md:text-2xl font-bold text-slate-800 leading-relaxed">
                    {currentQuestion.text}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
                {currentQuestion.options.map((opt, idx) => {
                    let stateStyles = "border-slate-200 hover:bg-slate-50 hover:border-primary/50 text-slate-700";
                    if (isAnswered) {
                        if (idx === currentQuestion.correctIndex) stateStyles = "bg-green-100 border-green-500 text-green-800 font-bold";
                        else if (idx === selectedOption) stateStyles = "bg-red-100 border-red-500 text-red-800";
                        else stateStyles = "border-slate-100 text-slate-400 opacity-50";
                    } else if (selectedOption === idx) {
                        stateStyles = "border-primary bg-primary/5 text-primary font-bold";
                    }

                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(idx)}
                            disabled={isAnswered}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${stateStyles}`}
                        >
                            <span>{opt}</span>
                            {isAnswered && idx === currentQuestion.correctIndex && <Check className="w-5 h-5" />}
                            {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <X className="w-5 h-5" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <button
                    onClick={nextQuestion}
                    disabled={!isAnswered}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isAnswered ? 'bg-slate-900 text-white shadow-lg hover:translate-x-1' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
