"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users, BookOpen, CheckCircle, TrendingUp,
    Activity, Award, BarChart3, Clock
} from "lucide-react";

interface AnalyticsData {
    users: {
        students: number;
        teachers: number;
        parents: number;
        admins: number;
        total: number;
    };
    activity: {
        quizzesThisWeek: number;
        activeUsers: number;
    };
    content: {
        assignments: number;
    };
    performance: {
        avgQuizScore: number;
        totalCompletions: number;
    };
}

export default function AdminAnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">
                <Activity className="w-8 h-8 animate-spin" />
                <span className="ml-3">Loading Analytics...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">
                Failed to load analytics data.
            </div>
        );
    }

    const statsCards = [
        {
            label: "Total Users",
            value: data.users.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            subtext: `${data.users.students} Students, ${data.users.teachers} Teachers`
        },
        {
            label: "Active This Week",
            value: data.activity.activeUsers,
            icon: Activity,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            subtext: "Users with recent activity"
        },
        {
            label: "Quizzes Completed",
            value: data.activity.quizzesThisWeek,
            icon: CheckCircle,
            color: "text-purple-600",
            bg: "bg-purple-50",
            subtext: "Last 7 days"
        },
        {
            label: "Avg Quiz Score",
            value: `${data.performance.avgQuizScore}%`,
            icon: Award,
            color: "text-amber-600",
            bg: "bg-amber-50",
            subtext: `${data.performance.totalCompletions} total completions`
        },
        {
            label: "Total Assignments",
            value: data.content.assignments,
            icon: BookOpen,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            subtext: "Active assignments"
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 z-0" />

            {/* Content */}
            <div className="relative z-10 pt-28 pb-12 px-6 md:px-12">
                <header className="mb-10 text-white">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" />
                        Owner Dashboard
                    </h1>
                    <p className="text-indigo-200 mt-1 font-medium">Real-time insights into platform health and usage</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {statsCards.map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-slate-800 tracking-tight mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-xs text-slate-500 mt-2">{stat.subtext}</p>
                        </motion.div>
                    ))}
                </div>

                {/* User Breakdown */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        User Distribution
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: "Students", value: data.users.students, color: "bg-blue-500" },
                            { label: "Teachers", value: data.users.teachers, color: "bg-purple-500" },
                            { label: "Parents", value: data.users.parents, color: "bg-emerald-500" },
                            { label: "Owners", value: data.users.admins, color: "bg-amber-500" }
                        ].map((role, i) => (
                            <div key={i} className="text-center">
                                <div className={`w-20 h-20 mx-auto rounded-full ${role.color} flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg`}>
                                    {role.value}
                                </div>
                                <p className="text-sm font-bold text-slate-600">{role.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Manage Users Table */}
                <ManageUsersTable />
            </div>
        </div>
    );
}

function ManageUsersTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const json = await res.json();
            if (json.success) {
                setUsers(json.users);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete user "${name}"? This action cannot be undone.`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();

            if (json.success) {
                // Refresh list
                fetchUsers();
                // Ideally show toast
                alert("User deleted successfully");
            } else {
                alert(json.error || "Failed to delete user");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting user");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-red-600" />
                Manage Users
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">No users found</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                                                user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'PARENT' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                            {user.role === 'ADMIN' ? 'OWNER' : user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => handleDelete(user.id, user.name || '')}
                                                disabled={deletingId === user.id}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
