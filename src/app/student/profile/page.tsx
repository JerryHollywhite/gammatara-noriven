
import { Metadata } from 'next';
import StudentProfilePage from '@/components/profile/StudentProfilePage';

export const metadata: Metadata = {
    title: 'My Profile | TaraLMS',
    description: 'Student Profile & Achievements',
};

export default function ProfilePage() {
    return <StudentProfilePage />;
}
