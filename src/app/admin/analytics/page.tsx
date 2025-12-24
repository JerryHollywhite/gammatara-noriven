
import { Metadata } from 'next';
import AdminAnalyticsDashboard from '@/components/admin/AdminAnalyticsDashboard';

export const metadata: Metadata = {
    title: 'System Analytics | TaraLMS',
    description: 'Admin Analytics Dashboard',
};

export default function AdminAnalyticsPage() {
    return <AdminAnalyticsDashboard />;
}
