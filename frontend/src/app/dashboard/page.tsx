'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface DashboardStats {
    active_jobs: number;
    total_candidates: number;
    pending_interviews: number;
    offers_accepted: number;
}

interface Activity {
    id: number;
    candidate_name: string;
    job_title: string;
    event: string;
    timestamp: string;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
            })
            .catch(err => console.error("Error fetching stats:", err));

        // Fetch recent activity
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/activity`)
            .then(res => res.json())
            .then(data => {
                setActivities(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching activity:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#01285e] to-slate-600">
                    Overview Dashboard
                </h2>
                <p className="text-slate-600 mt-2">Real-time insights across your recruitment pipeline.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/15 flex items-center justify-center text-[#01285e]">
                        <span className="material-icons-round text-3xl">cases</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-600">Active Jobs</h3>
                        <p className="text-3xl font-bold font-[family-name:var(--font-heading)] mt-1">
                            {loading ? "..." : stats?.active_jobs || 0}
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/15 flex items-center justify-center text-[#02adef]">
                        <span className="material-icons-round text-3xl">group</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-600">Total Candidates</h3>
                        <p className="text-3xl font-bold font-[family-name:var(--font-heading)] mt-1">
                            {loading ? "..." : stats?.total_candidates || 0}
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-400">
                        <span className="material-icons-round text-3xl">schedule</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-600">Pending Interviews</h3>
                        <p className="text-3xl font-bold font-[family-name:var(--font-heading)] mt-1">
                            {loading ? "..." : stats?.pending_interviews || 0}
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400">
                        <span className="material-icons-round text-3xl">how_to_reg</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-600">Offers Accepted</h3>
                        <p className="text-3xl font-bold font-[family-name:var(--font-heading)] mt-1">
                            {loading ? "..." : stats?.offers_accepted || 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="glass-panel p-6 lg:col-span-2 flex flex-col h-auto min-h-[16rem]">
                    <h3 className="text-xl font-semibold mb-4 text-[#01285e] flex items-center gap-2">
                        <span className="material-icons-round text-[#02adef]">notifications_active</span>
                        Recent Activity
                    </h3>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Loading activity...
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {activities.map(act => (
                                <div key={act.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#02adef] shrink-0">
                                        <span className="material-icons-round text-xl">bolt</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {act.candidate_name} <span className="text-slate-500 font-normal">({act.job_title})</span>
                                        </p>
                                        <p className="text-sm text-slate-600 mt-1">{act.event}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                                        {new Date(act.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600">
                            <span className="material-icons-round text-5xl mb-3 opacity-50">hourglass_empty</span>
                            <p>No recent activity available right now.</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
                    <Link href="/dashboard/jobs" className="btn btn-outline border-slate-200 hover:bg-[#02adef]/5 w-full justify-start text-left">
                        <span className="material-icons-round text-slate-600 group-hover:text-[#02adef]">add_box</span>
                        Post New Job
                    </Link>
                    <Link href="/dashboard/pipeline" className="btn btn-outline border-slate-200 hover:bg-[#02adef]/5 w-full justify-start text-left">
                        <span className="material-icons-round text-slate-600">update</span>
                        Review Pipeline
                    </Link>
                </div>
            </div>
        </div>
    );
}
