"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, BookOpen, CheckCircle, TrendingUp,
    Activity, Award, BarChart3, Clock, Search, ArrowUpDown, DollarSign,
    User as UserIcon, X
} from "lucide-react";
import FinanceDashboard from "./FinanceDashboard";
import UnifiedProfileEditor from "../profile/UnifiedProfileEditor";

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
    profile?: {
        name: string;
        email: string;
        phone: string;
        image: string;
    };
}

export default function AdminAnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USERS' | 'FINANCE'>('ANALYTICS');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
                <header className="mb-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-8 h-8" />
                            Owner Dashboard
                        </h1>
                        <p className="text-indigo-200 mt-1 font-medium">Real-time insights into platform health and usage</p>

                        <div className="flex items-center gap-4 mt-8 bg-white/10 p-1 rounded-xl backdrop-blur-sm w-fit border border-white/20">
                            <button
                                onClick={() => setActiveTab('ANALYTICS')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ANALYTICS' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:bg-white/10'}`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('USERS')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:bg-white/10'}`}
                            >
                                Manage Users
                            </button>
                            <button
                                onClick={() => setActiveTab('FINANCE')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'FINANCE' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:bg-white/10'}`}
                            >
                                Finance
                            </button>
                        </div>
                    </div>

                    <div
                        className="relative group cursor-pointer self-start md:self-center"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
                        <img
                            src={data.profile?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=Owner`}
                            alt="Profile"
                            className="relative w-14 h-14 rounded-full border-2 border-amber-500 object-cover bg-slate-800"
                        />
                        <div className="absolute top-0 right-0 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <UserIcon className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </header>

                {activeTab === 'FINANCE' ? (
                    <FinanceDashboard />
                ) : activeTab === 'USERS' ? (
                    <ManageUsersTable />
                ) : (
                    <>
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
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                            <h2 className="text-2xl font-bold mb-2">Manage Users</h2>
                            <p className="mb-6 opacity-90 max-w-lg">View, filter, and manage all registered users, teachers, and parents.</p>
                            <button
                                onClick={() => setActiveTab('USERS')}
                                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition"
                            >
                                Go to User Management
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Profile Manager Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
                        >
                            <button onClick={() => setIsProfileOpen(false)} className="absolute top-6 right-6 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 shadow-sm backdrop-blur-sm">
                                <X className="w-5 h-5" />
                            </button>
                            <UnifiedProfileEditor
                                initialData={{
                                    name: data.profile?.name || "Owner",
                                    email: data.profile?.email || "",
                                    phone: data.profile?.phone || null,
                                    image: data.profile?.image || "",
                                    role: "ADMIN"
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ManageUsersTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkParentId, setLinkParentId] = useState<string | null>(null);
    const [studentEmailLink, setStudentEmailLink] = useState("");
    const [linking, setLinking] = useState(false);

    const openLinkModal = (parentId: string) => {
        setLinkParentId(parentId);
        setStudentEmailLink("");
        setLinkModalOpen(true);
    };

    const handleLinkStudent = async () => {
        if (!linkParentId || !studentEmailLink) return;

        setLinking(true);
        try {
            const res = await fetch('/api/admin/parents/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: linkParentId, studentEmail: studentEmailLink })
            });
            const json = await res.json();
            if (json.success) {
                alert(json.message);
                setLinkModalOpen(false);
                setLinkParentId(null);
                setStudentEmailLink("");
            } else {
                alert(json.error || "Failed to link student");
            }
        } catch (e) {
            alert("Error linking student");
        } finally {
            setLinking(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative">
            {/* Link Modal */}
            {linkModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Link Child to Parent</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Student Email</label>
                            <input
                                type="email"
                                value={studentEmailLink}
                                onChange={(e) => setStudentEmailLink(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="student@example.com"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setLinkModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button
                                onClick={handleLinkStudent}
                                disabled={linking}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {linking ? "Linking..." : "Link Student"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-red-600" />
                Manage Users
            </h2>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="PARENT">Parent</option>
                        <option value="ADMIN">Owner</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Name
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('email')}
                            >
                                <div className="flex items-center gap-1">
                                    Email
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('role')}
                            >
                                <div className="flex items-center gap-1">
                                    Role
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center gap-1">
                                    Joined
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">No users found</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        {user.role === 'PARENT' && (
                                            <button
                                                onClick={() => openLinkModal(user.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Link Child
                                            </button>
                                        )}
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
