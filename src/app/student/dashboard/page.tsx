
import { Metadata } from 'next';
import StudentDashboardUI from '@/components/dashboard/student/StudentDashboardUI';

export const metadata: Metadata = {
    title: 'Student Dashboard | TaraLMS',
    description: 'My Learning Center',
};

export default function StudentDashboardPage() {
    return <StudentDashboardUI />;
}
