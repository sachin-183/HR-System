'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
    const [newJob, setNewJob] = useState({
        title: '', department: '', skills: '',
        description: '', responsibilities: '', qualifications: '',
        preferred_qualifications: '', what_we_offer: '',
        job_category: '', job_type: '', job_location: '', end_date: ''
    });
    const [status, setStatus] = useState<string | null>(null);
    const router = useRouter();

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Submitting...");
        try {
            const res = await fetch('http://localhost:8000/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob)
            });
            if (res.ok) {
                setStatus("Success! Redirecting...");
                setTimeout(() => {
                    router.push('/dashboard/jobs');
                }, 1500);
            } else {
                setStatus("Error: Failed to create job.");
            }
        } catch (err) {
            console.error(err);
            setStatus("Error: Failed to connect to server.");
        }
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <header className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-4">
                <Link href="/dashboard/jobs" className="btn btn-ghost p-2 rounded-full hover:bg-[#02adef]/5">
                    <span className="material-icons-round">arrow_back</span>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#02adef] to-[#01285e]">
                        Create New Job Listing
                    </h2>
                    <p className="text-slate-600 mt-1">Publish a new role to the public career portal.</p>
                </div>
            </header>

            <div className="glass-panel p-8 shadow-2xl">
                {status && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${status.includes('Success') ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        status.includes('Error') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            'bg-blue-500/10 text-[#02adef] border-blue-500/30'
                        }`}>
                        {status}
                    </div>
                )}

                <form onSubmit={handleCreateJob} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Job Title *</label>
                        <input
                            required
                            className="input-field max-w-xl"
                            placeholder="e.g. Senior Frontend Developer"
                            value={newJob.title}
                            onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Department *</label>
                        <input
                            required
                            className="input-field max-w-xl"
                            placeholder="e.g. Engineering"
                            value={newJob.department}
                            onChange={e => setNewJob({ ...newJob, department: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Required Skills *</label>
                        <p className="text-xs text-slate-600 mb-2">Separate skills with a comma. These will be used by our AI system during resume screening.</p>
                        <input
                            required
                            className="input-field max-w-xl"
                            placeholder="e.g. Python, React, PostgreSQL"
                            value={newJob.skills}
                            onChange={e => setNewJob({ ...newJob, skills: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Job Category</label>
                            <input className="input-field" placeholder="e.g. Information Technology" value={newJob.job_category} onChange={e => setNewJob({ ...newJob, job_category: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Job Type</label>
                            <input className="input-field" placeholder="e.g. Full Time" value={newJob.job_type} onChange={e => setNewJob({ ...newJob, job_type: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Job Location</label>
                            <input className="input-field" placeholder="e.g. Coimbatore" value={newJob.job_location} onChange={e => setNewJob({ ...newJob, job_location: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">End Date</label>
                        <input type="date" className="input-field max-w-xl" value={newJob.end_date} onChange={e => setNewJob({ ...newJob, end_date: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Job Description *</label>
                        <textarea required className="input-field min-h-[100px]" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Key Responsibilities</label>
                        <textarea className="input-field min-h-[100px]" value={newJob.responsibilities} onChange={e => setNewJob({ ...newJob, responsibilities: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Qualifications</label>
                        <textarea className="input-field min-h-[100px]" value={newJob.qualifications} onChange={e => setNewJob({ ...newJob, qualifications: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Preferred Qualifications</label>
                        <textarea className="input-field min-h-[100px]" value={newJob.preferred_qualifications} onChange={e => setNewJob({ ...newJob, preferred_qualifications: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">What We Offer</label>
                        <textarea className="input-field min-h-[100px]" value={newJob.what_we_offer} onChange={e => setNewJob({ ...newJob, what_we_offer: e.target.value })} />
                    </div>

                    <div className="pt-8 flex gap-4 border-t border-slate-100">
                        <Link href="/dashboard/jobs" className="btn btn-ghost">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary px-8 shadow-[0_0_15px_#2563eb66]"
                            disabled={status === "Submitting..." || status?.includes('Success')}
                        >
                            Publish Job Posting <span className="material-icons-round ml-1 text-sm">rocket_launch</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
