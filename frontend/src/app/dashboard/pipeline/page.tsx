'use client';
import { useState, useEffect } from 'react';

// STAGES in backend: Applied, Round 1, Round 2, HR Round, Offered, Rejected, Accepted
const STAGES = ["Applied", "Round 1", "Round 2", "HR Round", "Offered", "Rejected", "Accepted"];

interface Job {
    id: number;
    title: string;
}

interface TrackingLog {
    id: number;
    event: string;
    timestamp: string;
}

interface Candidate {
    id: number;
    name: string;
    email: string;
    job_id: number;
    stage: string;
    score_r1: number | null;
    score_r2: number | null;
    tracking_logs: TrackingLog[];
}

export default function PipelinePage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedCand, setSelectedCand] = useState<Candidate | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const jobsRes = await fetch('http://localhost:8000/api/jobs');
            const jobsData = await jobsRes.json();
            const jobMap: Record<number, string> = {};
            jobsData.forEach((j: Job) => { jobMap[j.id] = j.title; });
            setJobs(jobMap);

            const candsRes = await fetch('http://localhost:8000/api/candidates');
            const candsData = await candsRes.json();
            setCandidates(candsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStage = async (id: number, newStage: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/candidates/${id}/stage`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: newStage, notes: "Updated via Pipeline" })
            });
            if (res.ok) {
                fetchData();
                setSelectedCand(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // AI Mock Shortlist to next Stage
    const handleAIShortlist = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8000/api/candidates/${id}/stage`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: "Round 1", notes: "Shortlisted automatically by AI based on Job Description & Resume matching." })
            });
            if (res.ok) {
                fetchData();
                setSelectedCand(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendTestLink = async (cand: Candidate) => {
        const subject = "Technical Assessment Link";
        const body = `Dear ${cand.name},\n\nYou have been shortlisted for ${jobs[cand.job_id]}. Please take your technical assessment here: http://localhost:3000/portal/assessment`;
        try {
            const res = await fetch('http://localhost:8000/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to_email: cand.email, subject, body })
            });
            if (res.ok) alert(`SMTP Email successfully sent to ${cand.email}!`);
            else alert("Error sending SMTP Email.");
        } catch (err) {
            console.error(err);
            alert("Error sending SMTP Email.");
        }
    };

    const handleSendOnboarding = async (cand: Candidate) => {
        try {
            // Trigger the backend pipeline automation hook that generates the ShellKode PDF
            await updateStage(cand.id, "Offered");
            alert(`Official PDF Offer Email successfully queued & sent to ${cand.email}!`);
        } catch (err) {
            console.error(err);
            alert("Error sending PDF Email workflow.");
        }
    };

    const handleSimulateReply = async (cand: Candidate) => {
        const fakeReplyText = prompt("Simulate Candidate Reply via Email Inbox. (e.g. 'Yes! I happily accept!' or 'Actually I decline.')");
        if (!fakeReplyText) return;

        // Base64 Encode the test string for the simulated AI webhook
        const base64_reply = btoa(fakeReplyText);

        try {
            const res = await fetch('http://localhost:8000/api/email/process_reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate_id: cand.id, base64_reply })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`AI Extracted: "${data.ai_extract}"\n\nResulting Stage: ${data.new_stage}`);
                fetchData();
                setSelectedCand(null);
            }
        } catch (err) {
            console.error(err);
            alert("Error simulating reply processing.");
        }
    };

    return (
        <div className="animate-fade-in flex flex-col h-full bg-[#f8fafc] text-[#01285e] relative">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#01285e] to-slate-600">
                        Candidate Pipeline
                    </h2>
                    <p className="text-slate-600 mt-2">Monitor Candidates through assessment stages.</p>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-12 text-slate-600">
                    <span className="material-icons-round text-4xl animate-spin mb-2">autorenew</span>
                    <p>Loading pipeline data...</p>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-6 flex-1 items-start min-h-[60vh] custom-scrollbar">
                    {STAGES.map(stage => {
                        const stageCandidates = candidates.filter(c => c.stage === stage);
                        return (
                            <div key={stage} className="min-w-[300px] max-w-[300px] bg-white/60 rounded-xl border border-slate-200 backdrop-blur-md flex flex-col max-h-full">
                                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#02adef]/5 sticky top-0 rounded-t-xl z-10">
                                    <h3 className="font-semibold text-[#01285e] tracking-wide">{stage}</h3>
                                    <span className="px-2 py-1 bg-slate-50 rounded-md text-xs font-mono text-slate-700 font-bold border border-slate-200">
                                        {stageCandidates.length}
                                    </span>
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {stageCandidates.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelectedCand(c)}
                                            className="glass-panel p-4 cursor-pointer hover:border-[#02adef]/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all bg-slate-50/80 border-slate-200"
                                        >
                                            <h4 className="font-bold text-[#01285e] text-md tracking-tight truncate">{c.name}</h4>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/10 text-[#02adef] text-[0.65rem] font-bold uppercase rounded border border-blue-500/20 truncate max-w-full">
                                                {jobs[c.job_id] || "Unknown Job"}
                                            </span>
                                            {(c.score_r1 !== null || c.score_r2 !== null) && (
                                                <div className="mt-3 flex gap-4 pt-3 border-t border-slate-100 text-xs">
                                                    {c.score_r1 !== null && <div className="flex flex-col"><span className="text-slate-600 font-medium tracking-wide">R1 SCORE</span><span className={`font-bold ${c.score_r1 >= 70 ? 'text-green-400' : 'text-red-400'}`}>{c.score_r1.toFixed(1)}%</span></div>}
                                                    {c.score_r2 !== null && <div className="flex flex-col"><span className="text-slate-600 font-medium tracking-wide">R2 SCORE</span><span className={`font-bold ${c.score_r2 >= 70 ? 'text-green-400' : 'text-red-400'}`}>{c.score_r2.toFixed(1)}%</span></div>}
                                                </div>
                                            )}
                                            {c.stage === "Rejected" && (
                                                <div className="mt-2 text-[0.65rem] font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                                    <span className="material-icons-round text-[10px] mr-1 align-middle">error_outline</span>
                                                    {c.score_r1 !== null && c.score_r1 < 70 ? "Eliminated: Failed R1 Aptitude Cutoff" :
                                                        c.score_r2 !== null && c.score_r2 < 70 ? "Eliminated: Failed R2 Coding Assessment" :
                                                            "Eliminated: AI Screening or Offer Declined"}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {stageCandidates.length === 0 && (
                                        <div className="text-center py-8 text-sm text-slate-600 font-medium italic border border-dashed border-slate-100 rounded-lg bg-[#02adef]/50">
                                            No candidates
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* AI / Action Sidebar Drawer */}
            {selectedCand && (
                <div className="absolute top-0 right-0 w-96 h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-20 animate-fade-in pb-10">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <h3 className="text-2xl font-bold">{selectedCand.name}</h3>
                            <p className="text-sm text-[#02adef] mt-1">{selectedCand.email}</p>
                            <div className="mt-2 text-xs font-semibold uppercase px-2 py-1 bg-[#02adef]/10 inline-block rounded">
                                {jobs[selectedCand.job_id]}
                            </div>
                        </div>
                        <button onClick={() => setSelectedCand(null)} className="text-slate-600 hover:text-[#01285e] bg-slate-50 p-1 rounded-full aspect-square flex items-center justify-center">
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Quick Actions</h4>
                            <div className="flex flex-col gap-2">
                                {selectedCand.stage === "Applied" && (
                                    <button
                                        className="btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-[#01285e] text-sm shadow-[0_0_15px_#9333ea66]"
                                        onClick={() => handleAIShortlist(selectedCand.id)}
                                    >
                                        <span className="material-icons-round">auto_awesome</span> Run AI Resume Screening
                                    </button>
                                )}

                                {["Round 1", "Round 2"].includes(selectedCand.stage) && (
                                    <button
                                        className="btn bg-[#02adef] hover:bg-[#0295d1] text-white text-sm"
                                        onClick={() => handleSendTestLink(selectedCand)}
                                    >
                                        <span className="material-icons-round">email</span> Email Assessment Link
                                    </button>
                                )}

                                {selectedCand.stage === "Offered" && (
                                    <>
                                        <button
                                            className="btn bg-green-600 hover:bg-green-500 text-white text-sm"
                                            onClick={() => handleSendOnboarding(selectedCand)}
                                        >
                                            <span className="material-icons-round">mark_email_read</span> Send Official Offer Letter
                                        </button>
                                        <button
                                            className="btn bg-indigo-600 hover:bg-indigo-500 text-white text-sm shadow-[0_0_15px_#4f46e566]"
                                            onClick={() => handleSimulateReply(selectedCand)}
                                        >
                                            <span className="material-icons-round">contact_mail</span> AI: Process Inbox Reply via Base64
                                        </button>
                                    </>
                                )}

                                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1 font-medium bg-slate-50/50 p-2 rounded">
                                    <span className="material-icons-round text-sm text-yellow-500">warning</span>
                                    <span>Manual Stage Update:</span>
                                </div>
                                <select
                                    className="input-field py-2 text-sm appearance-none bg-slate-50 cursor-pointer"
                                    value={selectedCand.stage}
                                    onChange={(e) => updateStage(selectedCand.id, e.target.value)}
                                >
                                    {STAGES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Activity Timeline</h4>
                            <div className="space-y-4 border-l-2 border-slate-200 ml-2 pl-4 relative">
                                {selectedCand.tracking_logs?.map(log => (
                                    <div key={log.id} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{log.event}</p>
                                        <span className="text-xs text-slate-600 font-mono mt-1 block">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {!selectedCand.tracking_logs?.length && (
                                    <p className="text-sm text-slate-600 italic">No activity logs recorded.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(1, 40, 94, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(1, 40, 94, 0.4);
                }
            `}</style>
        </div>
    );
}
