
import { Metadata } from 'next';
import LiveClassManager from '@/components/live-class/LiveClassManager';

export const metadata: Metadata = {
    title: 'Live Classes | TaraLMS',
    description: 'Manage Zoom Live Classes',
};

export default function TeacherLiveClassPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 md:px-12">
            <LiveClassManager />
        </div>
    );
}
