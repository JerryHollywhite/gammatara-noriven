
import { Metadata } from 'next';
import TeacherDashboardUI from '@/components/dashboard/teacher/TeacherDashboardUI';

export const metadata: Metadata = {
    title: 'Teacher Dashboard | TaraLMS',
    description: 'Educator Portal',
};

export default function TeacherDashboardPage() {
    return <TeacherDashboardUI />;
}
