"use client";

import QuizRunner from "@/components/lms/QuizRunner";
import { useState } from "react";

const MOCK_QUESTIONS = [
    {
        id: 1,
        text: "What is the value of x in the equation 2x + 4 = 10?",
        options: ["2", "3", "4", "5"],
        correctIndex: 1
    },
    {
        id: 2,
        text: "Which of these is NOT a prime number?",
        options: ["7", "11", "15", "19"],
        correctIndex: 2
    },
    {
        id: 3,
        text: "If a triangle has angles 90° and 45°, what is the third angle?",
        options: ["30°", "45°", "60°", "90°"],
        correctIndex: 1
    }
];

export default function MockQuizPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <QuizRunner
                title="Basic Algebra & Geometry Test"
                questions={MOCK_QUESTIONS}
                onComplete={(score) => console.log("Done", score)}
                onClose={() => window.location.href = '/student/dashboard'}
            />
        </div>
    );
}
