'use client';
import { useState, useEffect } from 'react';

// Similar interface to HR dashboard
interface Job {
    id: number;
    title: string;
    department: string;
    skills: string;
    status: string;
    description?: string;
    responsibilities?: string;
    qualifications?: string;
    preferred_qualifications?: string;
    what_we_offer?: string;
    job_category?: string;
    job_type?: string;
    job_location?: string;
    end_date?: string;
}

export default function PublicJobBoard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingJob, setViewingJob] = useState<Job | null>(null);
    const [applyingTo, setApplyingTo] = useState<Job | null>(null);

    const [applicant, setApplicant] = useState({ name: '', email: '' });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [applyStatus, setApplyStatus] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/jobs')
            .then(res => res.json())
            .then(data => {
                // Filter active jobs only
                const activeJobs = data.filter((j: Job) => j.status === 'Active');
                setJobs(activeJobs);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyStatus("Submitting...");
        if (!applyingTo) return;

        try {
            const res = await fetch('http://localhost:8000/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: applicant.name,
                    email: applicant.email,
                    job_id: applyingTo.id
                })
            });

            if (res.ok) {
                setApplyStatus("Success! Your application has been received.");
                setTimeout(() => {
                    setApplyingTo(null);
                    setApplyStatus(null);
                    setApplicant({ name: '', email: '' });
                    setResumeFile(null);
                }, 3000);
            } else if (res.status === 400) {
                setApplyStatus("Error: You have already applied to this role with this email.");
            } else {
                setApplyStatus("Failed to submit application. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setApplyStatus("Server error occurred.");
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <header className="text-center">
                <span className="material-icons-round text-5xl text-[#02adef] mb-2">work</span>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#02adef] to-[#01285e]">
                    Careers Portal
                </h1>
                <p className="text-slate-600 mt-2 max-w-lg mx-auto">
                    Explore open positions and join our dynamic team. Apply with your email and resume details below.
                </p>
            </header>

            {loading ? (
                <div className="text-center py-12 text-slate-600">
                    <span className="material-icons-round text-4xl animate-spin mb-2">autorenew</span>
                    <p>Loading open positions...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-panel p-12 text-center max-w-2xl mx-auto shadow-2xl">
                    <span className="material-icons-round text-6xl text-slate-600 mb-4">do_not_disturb</span>
                    <h3 className="text-xl font-bold text-slate-700">No open positions</h3>
                    <p className="text-slate-600 mt-2">Check back later for new opportunities!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-panel p-6 border-l-4 border-l-blue-500 flex flex-col hover:-translate-y-1 transition-transform">
                            <span className="text-xs font-bold text-[#02adef] uppercase tracking-wider">{job.department}</span>
                            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mt-1">{job.title}</h3>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex-grow">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Skills Needed:</p>
                                <div className="flex gap-2 flex-wrap">
                                    {job.skills.split(",").map(s => s.trim()).filter(s => s).map(s => (
                                        <span key={s} className="px-2 py-1 bg-slate-50 rounded-md text-xs font-medium text-slate-700 shadow-sm border border-slate-200">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    className="btn btn-primary px-6"
                                    onClick={() => setViewingJob(job)}
                                >
                                    View Details & Apply
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Job Details Modal */}
            {viewingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f8fafc]/80 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl shadow-blue-900/20 relative border border-blue-500/30">
                        <button
                            onClick={() => setViewingJob(null)}
                            className="absolute top-4 right-4 text-slate-600 hover:text-[#01285e]"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                        <div className="mb-6 border-b border-slate-200 pb-4">
                            <h2 className="text-3xl font-bold text-[#01285e]">{viewingJob.title}</h2>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 font-medium">
                                {viewingJob.job_category && <span className="flex items-center gap-1"><span className="material-icons-round text-[16px]">category</span> {viewingJob.job_category}</span>}
                                {viewingJob.job_type && <span className="flex items-center gap-1"><span className="material-icons-round text-[16px]">work</span> {viewingJob.job_type}</span>}
                                {viewingJob.job_location && <span className="flex items-center gap-1"><span className="material-icons-round text-[16px]">location_on</span> {viewingJob.job_location}</span>}
                                {viewingJob.end_date && <span className="flex items-center gap-1 text-red-500"><span className="material-icons-round text-[16px]">event</span> Apply by {new Date(viewingJob.end_date).toLocaleDateString()}</span>}
                            </div>
                        </div>

                        <div className="space-y-6 text-slate-700">
                            {viewingJob.description && (
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-[#01285e]">Job Description</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.description}</p>
                                </div>
                            )}
                            {viewingJob.responsibilities && (
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-[#01285e]">Key Responsibilities</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.responsibilities}</p>
                                </div>
                            )}
                            {viewingJob.qualifications && (
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-[#01285e]">Qualifications</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.qualifications}</p>
                                </div>
                            )}
                            {viewingJob.preferred_qualifications && (
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-[#01285e]">Preferred Qualifications</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.preferred_qualifications}</p>
                                </div>
                            )}
                            {viewingJob.what_we_offer && (
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-[#01285e]">What We Offer</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.what_we_offer}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <button
                                className="btn btn-primary w-full text-lg py-3"
                                onClick={() => { setApplyingTo(viewingJob); setViewingJob(null); }}
                            >
                                Proceed to Application
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Modal */}
            {applyingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f8fafc]/80 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 shadow-2xl shadow-blue-900/20 animate-fade-in relative border border-blue-500/30">
                        <button
                            onClick={() => { setApplyingTo(null); setApplyStatus(null); setResumeFile(null); }}
                            className="absolute top-4 right-4 text-slate-600 hover:text-[#01285e]"
                        >
                            <span className="material-icons-round">close</span>
                        </button>

                        <div className="mb-6">
                            <span className="inline-block px-2 py-1 bg-blue-500/10 text-[#02adef] text-xs font-bold uppercase rounded border border-blue-500/20 mb-2">
                                {applyingTo.department}
                            </span>
                            <h2 className="text-2xl font-bold">Apply for role</h2>
                            <h3 className="text-lg text-slate-700 font-semibold">{applyingTo.title}</h3>
                        </div>

                        {/* AI Mock Resume note */}
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-purple-300 mb-6 flex gap-3 text-sm">
                            <span className="material-icons-round mt-0.5">auto_awesome</span>
                            <p>Our AI system will automatically screen your profile based on the job description directly upon submission.</p>
                        </div>

                        {applyStatus && (
                            <div className={`p-3 rounded-lg mb-4 text-sm font-medium border ${applyStatus.includes('Success') ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                applyStatus.includes('Error') || applyStatus.includes('Failed') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                    'bg-blue-500/10 text-[#02adef] border-blue-500/30'
                                }`}>
                                {applyStatus}
                            </div>
                        )}

                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    placeholder="Jane Doe"
                                    value={applicant.name}
                                    onChange={e => setApplicant({ ...applicant, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="input-field"
                                    placeholder="jane.doe@example.com"
                                    value={applicant.email}
                                    onChange={e => setApplicant({ ...applicant, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Resume Upload</label>
                                <label className="block border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <span className="material-icons-round text-slate-600 block mb-1">upload_file</span>
                                    {resumeFile ? (
                                        <span className="text-sm text-green-400 font-bold block">{resumeFile.name}</span>
                                    ) : (
                                        <span className="text-xs text-slate-600 transition-colors">Select PDF/Docx</span>
                                    )}
                                    <input
                                        type="file"
                                        required
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setResumeFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="pt-4 mt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={applyStatus === "Submitting..." || applyStatus?.includes("Success")}
                                >
                                    {applyStatus === "Submitting..." ? "Evaluating via AI..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
