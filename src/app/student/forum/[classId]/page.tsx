import { Metadata } from 'next';
import ClassForum from '@/components/forum/ClassForum';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Class Forum | TaraLMS',
    description: 'Class Discussion Forum',
};

export default async function StudentForumPage({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = await params;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header with back button */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        href="/student/dashboard"
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800">Class Forum</h1>
                        <p className="text-sm text-slate-500">Ask questions & discuss</p>
                    </div>
                </div>
            </div>

            {/* Forum Component */}
            <ClassForum classId={classId} userRole="STUDENT" />
        </div>
    );
}
