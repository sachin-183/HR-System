"use client";

import { useEffect, useState } from "react";

export default function HROnboardingDashboard() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [previewDoc, setPreviewDoc] = useState<any>(null);

    const handlePreviewClick = async (doc: any) => {
        setPreviewDoc({ ...doc, loading: true });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`}/api/documents/${doc.id}/file`);
            if (res.ok) {
                const data = await res.json();
                setPreviewDoc({ ...doc, file_data: data.file_data, loading: false });
            } else {
                setPreviewDoc({ ...doc, loading: false });
            }
        } catch (e) {
            setPreviewDoc({ ...doc, loading: false });
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/candidates`);
            if (res.ok) {
                const data = await res.json();
                // We want candidates who are Accepted (in onboarding)
                // Filter out those who haven't accepted the offer
                const onboardingCands = data.filter((c: any) => c.stage === 'Accepted');
                setCandidates(onboardingCands);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateDocumentStatus = async (docId: number, status: string) => {
        const notes = prompt(`Enter optional reason for marking as ${status}:`) || "";
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`}/api/documents/${docId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hr_status: status, notes })
            });
            if (res.ok) {
                alert(`Document ${status} successfully!`);
                await fetchCandidates();
                if (selectedCandidate) {
                    const freshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/candidates`);
                    if (freshRes.ok) {
                        const rawData = await freshRes.json();
                        const updatedMe = rawData.find((c: any) => c.id === selectedCandidate.id);
                        setSelectedCandidate(updatedMe);
                    }
                }
            }
        } catch (err) {
            alert("Error updating document status.");
        }
    };

    const handleCompleteOnboarding = async (candidateId: number) => {
        if (!confirm("Are you sure you want to approve this candidate's onboarding and send the completion email?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`}/api/candidates/${candidateId}/complete_onboarding`, {
                method: "POST"
            });
            if (res.ok) {
                alert("Candidate onboarding completed! Email has been dispatched.");
                await fetchCandidates();
                const freshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/candidates`);
                if (freshRes.ok) {
                    const rawData = await freshRes.json();
                    const updatedMe = rawData.find((c: any) => c.id === candidateId);
                    setSelectedCandidate(updatedMe);
                }
            } else {
                alert("Failed to complete onboarding.");
            }
        } catch (err) {
            console.error(err);
            alert("Error completing candidate onboarding.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 pb-12 animate-fade-in relative">
            <div className="absolute top-0 right-0 py-2 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm border border-indigo-100 flex items-center gap-2">
                <span className="material-icons-round">psychology</span>
                AI Orchestration Active
            </div>

            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-[#01285e] mb-2 font-[family-name:var(--font-heading)]">
                    Onboarding Control Center
                </h1>
                <p className="text-slate-500 max-w-2xl font-medium">
                    Monitor candidate documentation, review OCR Verification results, and approve background checks in real-time.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-160px)] min-h-[750px] pb-8">
                {/* Onboarding Queue List */}
                <div className="lg:col-span-1 border border-slate-200 bg-white shadow-xl shadow-blue-900/5 rounded-3xl p-6 flex flex-col h-full overflow-hidden">
                    <h2 className="text-xl font-bold text-[#01285e] border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                        Active Onboardings
                        <span className="bg-[#02adef] text-white text-xs px-2 py-1 rounded-full">{candidates.length}</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {candidates.length === 0 ? (
                            <p className="text-slate-400 text-center py-6">No candidates in Onboarding stage.</p>
                        ) : (
                            candidates.map(cand => {
                                const docs = cand.documents || [];
                                const totalDocs = docs.length;
                                const approved = docs.filter(d => d.hr_status === 'Approved').length;
                                const completion = Math.round((totalDocs / 6) * 100);

                                return (
                                    <div
                                        key={cand.id}
                                        onClick={() => setSelectedCandidate(cand)}
                                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${selectedCandidate?.id === cand.id
                                            ? 'border-blue-500 bg-blue-50/50'
                                            : 'border-slate-100 bg-slate-50 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-[#01285e] truncate">{cand.name}</h3>
                                            <span className="text-xs font-bold text-slate-400 mt-1">{cand.onboarding_status}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                                            <span>{totalDocs}/6 Uploaded</span>
                                            <span>{approved} Verified</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-[#02adef] h-full"
                                                style={{ width: `${completion}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Candidate Dashboard Viewer */}
                <div className="lg:col-span-3 border border-slate-200 bg-white shadow-xl shadow-blue-900/5 rounded-3xl p-6 flex flex-col h-full overflow-hidden relative">
                    {selectedCandidate ? (
                        <>
                            <div className="border-b border-slate-100 pb-6 mb-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#01285e] to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                                        {selectedCandidate.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-[#01285e]">{selectedCandidate.name}</h2>
                                            {selectedCandidate.onboarding_status !== 'Completed' && selectedCandidate.documents?.length > 0 && (
                                                <button
                                                    onClick={() => handleCompleteOnboarding(selectedCandidate.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-green-500/20 flex items-center gap-1 transition-all"
                                                >
                                                    <span className="material-icons-round text-sm">mark_email_read</span>
                                                    Verify & Complete
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-slate-500 font-medium text-sm flex gap-2 mt-1">
                                            <span className="material-icons-round text-[16px]">mail</span> {selectedCandidate.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                        <p className="font-bold text-[#01285e]">{selectedCandidate.onboarding_status}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Uploaded</p>
                                        <p className="font-bold text-blue-600">{selectedCandidate.documents?.length || 0} / 6</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-[#01285e] mb-4 text-lg">Document Assessment Vault</h3>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {!selectedCandidate.documents || selectedCandidate.documents.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <span className="material-icons-round text-6xl opacity-30 mb-2">folder_off</span>
                                        <p>Candidate has not uploaded any documents yet.</p>
                                    </div>
                                ) : (
                                    selectedCandidate.documents.map((doc: any) => (
                                        <div key={doc.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                <h4 className="font-bold text-[#01285e] text-lg flex items-center gap-2">
                                                    <span className="material-icons-round text-[#02adef]">insert_drive_file</span>
                                                    {doc.doc_type}
                                                </h4>
                                                <span className="text-xs text-slate-400 font-semibold">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm font-semibold p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-500">AI Confidence:</span>
                                                        <span className={doc.ai_confidence > 0.8 ? 'text-green-600' : 'text-amber-600'}>
                                                            {(doc.ai_confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-semibold p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-500">OCR Check:</span>
                                                        <span className={
                                                            doc.ai_status === 'Approved' ? 'text-green-600' :
                                                                doc.ai_status === 'Rejected' ? 'text-red-600' :
                                                                    'text-amber-600'
                                                        }>
                                                            {doc.ai_status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm font-semibold p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                                        <span className="text-indigo-700">HR Status:</span>
                                                        <span className={
                                                            doc.hr_status === 'Approved' ? 'text-green-600' :
                                                                doc.hr_status === 'Rejected' ? 'text-red-600' :
                                                                    'text-slate-600'
                                                        }>
                                                            {doc.hr_status}
                                                        </span>
                                                    </div>

                                                    {doc.notes && (
                                                        <div className="text-xs italic text-red-600 bg-red-50 p-2 rounded">Note: {doc.notes}</div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        {doc.hr_status !== 'Approved' && (
                                                            <button
                                                                onClick={() => updateDocumentStatus(doc.id, "Approved")}
                                                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-md shadow-green-500/20 transition-all font-[family-name:var(--font-heading)]"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {doc.hr_status !== 'Rejected' && (
                                                            <button
                                                                onClick={() => updateDocumentStatus(doc.id, "Rejected")}
                                                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-md shadow-red-500/20 transition-all font-[family-name:var(--font-heading)]"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Simulated File Preview container */}
                                            <div
                                                onClick={() => handlePreviewClick(doc)}
                                                className="h-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-medium cursor-pointer hover:bg-slate-100 hover:text-[#02adef] hover:border-[#02adef]/50 transition-colors"
                                            >
                                                <span className="material-icons-round text-lg mr-1">preview</span> Preview Secure Document Payload
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="material-icons-round text-7xl opacity-30 mb-4">admin_panel_settings</span>
                            <p className="text-lg font-medium text-slate-500">Select an onboarding candidate to review documents.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-[#01285e] flex items-center gap-2">
                                <span className="material-icons-round text-[#02adef]">visibility</span>
                                Document Preview: {previewDoc.doc_type}
                            </h2>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex justify-center items-center hover:bg-slate-300 transition-colors"
                            >
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto bg-slate-100 flex justify-center items-center">
                            {previewDoc.loading ? (
                                <div className="text-center text-slate-500 flex flex-col items-center">
                                    <span className="material-icons-round text-6xl opacity-30 animate-spin mb-4">refresh</span>
                                    <p className="font-bold">Fetching High-Res Data from AWS...</p>
                                </div>
                            ) : previewDoc.file_data?.startsWith('data:image/') ? (
                                <img src={previewDoc.file_data} alt={previewDoc.doc_type} className="max-w-full max-h-[85vh] object-contain shadow-md border border-slate-200" />
                            ) : previewDoc.file_data?.startsWith('data:application/pdf') ? (
                                <iframe src={previewDoc.file_data} title={previewDoc.doc_type} className="w-full h-[80vh] shadow-md border border-slate-200" />
                            ) : previewDoc.file_data ? (
                                <div className="text-center text-slate-500">
                                    <span className="material-icons-round text-6xl opacity-30 mb-2">insert_drive_file</span>
                                    <p>File preview not available for this format. Download required.</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <span className="material-icons-round text-6xl opacity-30 mb-2">error_outline</span>
                                    <p>No file data found for this document, likely a simulated placeholder.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center text-sm">
                            <div className="flex gap-4">
                                <span className={`font-semibold ${previewDoc.ai_confidence > 0.8 ? 'text-green-600' : 'text-amber-600'}`}>
                                    AI Confidence: {(previewDoc.ai_confidence * 100).toFixed(0)}%
                                </span>
                                <span className="text-slate-400">|</span>
                                <span className={`font-semibold ${previewDoc.hr_status === 'Approved' ? 'text-green-600' :
                                    previewDoc.hr_status === 'Rejected' ? 'text-red-600' :
                                        'text-slate-600'
                                    }`}>
                                    Current HR Status: {previewDoc.hr_status}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        updateDocumentStatus(previewDoc.id, "Rejected");
                                        setPreviewDoc(null);
                                    }}
                                    className="px-4 py-2 border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        updateDocumentStatus(previewDoc.id, "Approved");
                                        setPreviewDoc(null);
                                    }}
                                    className="px-6 py-2 bg-[#02adef] hover:bg-blue-600 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 transition-all"
                                >
                                    Approve Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
