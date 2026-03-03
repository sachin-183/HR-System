'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Job {
    id: number;
    title: string;
    department: string;
    skills: string;
    status: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = () => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/jobs`)
            .then(res => res.json())
            .then(data => {
                setJobs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching jobs", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <div className="animate-fade-in relative z-0">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#01285e] to-slate-600">
                        Job Postings
                    </h2>
                    <p className="text-slate-600 mt-2">Manage open roles and requirements.</p>
                </div>
                <Link
                    href="/dashboard/jobs/new"
                    className="btn btn-primary shadow-lg shadow-[#02adef]/20"
                >
                    <span className="material-icons-round text-lg">add</span> Post Job
                </Link>
            </header>

            {loading ? (
                <div className="text-center py-12 text-slate-600">
                    <span className="material-icons-round text-4xl animate-spin mb-2">autorenew</span>
                    <p>Loading jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-panel p-12 text-center flex flex-col items-center">
                    <span className="material-icons-round text-6xl text-slate-600 mb-4">work_outline</span>
                    <h3 className="text-xl font-bold text-slate-700">No active jobs found</h3>
                    <p className="text-slate-600 mt-2">Click the Post Job button above to create your first listing.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-panel p-6 border-t-2 border-t-purple-500 flex flex-col">
                            <span className="text-xs font-bold text-[#01285e] uppercase tracking-wider">{job.department}</span>
                            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mt-1">{job.title}</h3>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex-grow">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Required Skills:</p>
                                <div className="flex gap-2 flex-wrap">
                                    {job.skills.split(",").map(s => s.trim()).filter(s => s).map(s => (
                                        <span key={s} className="px-2 py-1 bg-[#02adef]/5 border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
                                    {job.status}
                                </span>
                                <Link href="/dashboard/pipeline" className="btn btn-ghost text-sm py-1 border border-slate-200 hover:border-slate-500">
                                    Manage Candidates
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
