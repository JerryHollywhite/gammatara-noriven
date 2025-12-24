
import { notFound } from "next/navigation";
import QuizRunner from "@/components/quiz/QuizRunner";
import { getQuizByLessonId } from "@/lib/tara-quiz";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Can we get lesson details here? 
// Ideally we need title. For now we might just generic "Quiz".
// Or we fetch lessons too.

import { getLessons, getSubjects } from "@/lib/tara-content";

export default async function QuizPage({ params }: { params: { lessonId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { lessonId } = params;
    const questions = await getQuizByLessonId(lessonId);

    if (!questions || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center p-6">
                <h1 className="text-2xl font-bold text-slate-800">Quiz Not Found</h1>
                <p className="text-slate-500">Sorry, there is no quiz content available for this lesson yet.</p>
                <a href="/modules" className="text-indigo-600 font-bold hover:underline">Back to Modules</a>
            </div>
        );
    }

    // Attempt to find lesson title (Optional but nice)
    // This is inefficient if we don't know the subjectId. 
    // For now, let's just pass "Lesson Quiz" if we can't easily get the title without iterating all subjects.
    // Optimization: In real app, we might pass title via query params or fetch optimised.
    const title = "Lesson Quiz";

    return (
        <div className="min-h-screen bg-white">
            <QuizRunner
                lessonId={lessonId}
                lessonTitle={title}
                questions={questions}
            />
        </div>
    );
}
