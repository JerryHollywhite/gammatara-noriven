
import { Metadata } from 'next';
import ParentDashboardUI from '@/components/dashboard/parent/ParentDashboardUI';

export const metadata: Metadata = {
    title: 'Parent Portal | TaraLMS',
    description: 'Monitor your child\'s progress',
};

export default function ParentDashboardPage() {
    return <ParentDashboardUI />;
}
