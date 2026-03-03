"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingDashboard() {
    const router = useRouter();
    const [candidateName, setCandidateName] = useState('');
    const [candidateId, setCandidateId] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    const [uploadType, setUploadType] = useState('Photo');
    const [uploading, setUploading] = useState(false);
    const [studentType, setStudentType] = useState('college');
    const [experienceLevel, setExperienceLevel] = useState('fresher');
    const [onboardingStatus, setOnboardingStatus] = useState('In Progress');

    let checkList = [
        "Photo",
        "PAN Card",
        "Aadhar",
        "Bank Details",
        "10th Mark Sheet",
        "12th Mark Sheet"
    ];

    if (studentType === 'ug') {
        checkList.push("UG Degree Certificate");
    } else if (studentType === 'graduate') {
        checkList.push("UG Degree Certificate", "PG Degree Certificate");
    }

    if (experienceLevel === 'experienced') {
        checkList.push("Experience Letter");
    }

    // Update uploadType if it's no longer in the checklist
    useEffect(() => {
        if (!checkList.includes(uploadType)) {
            setUploadType("Photo");
        }
    }, [studentType, experienceLevel, uploadType]);

    useEffect(() => {
        const id = localStorage.getItem('onboarding_candidate_id');
        const name = localStorage.getItem('onboarding_candidate_name');
        if (!id || !name) {
            router.push('/onboarding/login');
            return;
        }
        setCandidateId(id);
        setCandidateName(name);
        fetchData(id);
    }, [router]);

    const fetchData = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/candidates`);
            if (res.ok) {
                const cands = await res.json();
                const me = cands.find((c: any) => c.id.toString() === id.toString());
                if (me) {
                    setDocuments(me.documents || []);
                    if (me.onboarding_status) setOnboardingStatus(me.onboarding_status);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            // Simulating base64 file upload
            setUploading(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Str = reader.result?.toString() || "";

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            candidate_id: parseInt(candidateId),
                            doc_type: uploadType,
                            file_data: base64Str, // Real file upload payload
                        }),
                    });

                    if (res.ok) {
                        alert(`Uploaded ${uploadType} successfully for AI Evaluation.`);
                        fetchData(candidateId);
                    }
                } catch (err) {
                    alert('Upload failed.');
                } finally {
                    setUploading(false);
                }
            };
        };
        input.click();
    }

    const handleDelete = async (docId: number) => {
        if (!confirm("Are you sure you want to delete this document? You will need to re-upload it.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`}/api/documents/${docId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert("Document successfully deleted.");
                fetchData(candidateId);
            } else {
                alert("Failed to delete document.");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting document.");
        }
    };

    const submitOnboarding = async () => {
        if (!confirm("Are you sure you want to submit? You won't be able to upload or edit documents after submission while HR is reviewing.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`}/api/candidates/${candidateId}/submit_onboarding`, {
                method: 'POST'
            });
            if (res.ok) {
                alert("Documents securely submitted! Redirecting to status dashboard.");
                fetchData(candidateId);
            } else {
                alert("Failed to submit onboarding pipeline.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Loading Onboarding Vault...</div>;

    const uploadedDocTypes = new Set(documents.map(d => d.doc_type));
    const completedDocsCount = checkList.filter(req => uploadedDocTypes.has(req)).length;
    const progress = Math.min((completedDocsCount / checkList.length) * 100, 100);
    const isComplete = progress === 100;

    if (onboardingStatus === 'Under Verification') {
        return (
            <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-8">
                <div className="text-center space-y-6 py-12 animate-fade-in relative max-w-lg bg-white p-12 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
                    <div className="absolute inset-0 blob blob-1 !opacity-20 pointer-events-none"></div>
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500/30">
                        <span className="material-icons-round text-5xl text-green-400">gpp_good</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#01285e]">Dashboard Locked for Verification</h2>
                    <p className="text-slate-600">
                        {candidateName}, you have successfully submitted all your required documents. The HR team is now verifying your payload.
                        Please check your email for any status updates.
                    </p>
                    <div className="bg-amber-50 text-amber-600 font-bold p-4 rounded-xl shadow-inner border border-amber-100 mt-6 inline-flex gap-2 items-center text-sm">
                        <span className="material-icons-round text-amber-500 text-lg">pending_actions</span> Current Status: Under Verification
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="ShellKode Logo" className="w-8 h-8 object-contain rounded-md drop-shadow-sm" />
                    <h1 className="text-xl font-bold text-[#01285e] font-[family-name:var(--font-heading)] truncate">
                        Onboarding Profile
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600">Welcome, {candidateName}</span>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/onboarding/login'); }}
                        className="text-xs font-semibold px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-5xl self-center w-full animate-slide-up flex flex-col gap-8">

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-[#01285e] mb-4">Onboarding Progress</h2>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-[#02adef] transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-extrabold text-[#02adef] w-12 text-right">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {isComplete
                            ? "All documents uploaded nicely! You can now securely SUBMIT your payload to trigger the HR review."
                            : "Please upload the mandatory documents below safely. They will be analyzed by our OCR Verification Engine instantly."}
                    </p>
                </section>

                {/* Educational Background Selector */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-[#01285e] mb-4">Educational Background</h2>
                    <label className="text-sm font-medium text-slate-600 block mb-4">What is your current highest education level? This determines your required documents.</label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${studentType === 'college' ? 'bg-blue-50/80 border-[#02adef] shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                            <input type="radio" value="college" name="edu" className="hidden"
                                checked={studentType === 'college'}
                                onChange={(e) => setStudentType(e.target.value)}
                            />
                            <span className="font-bold text-[#01285e] mb-1">College Student</span>
                            <span className="text-xs text-slate-600">Currently studying (10th & 12th required)</span>
                        </label>

                        <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${studentType === 'ug' ? 'bg-blue-50/80 border-[#02adef] shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                            <input type="radio" value="ug" name="edu" className="hidden"
                                checked={studentType === 'ug'}
                                onChange={(e) => setStudentType(e.target.value)}
                            />
                            <span className="font-bold text-[#01285e] mb-1">UG Completed</span>
                            <span className="text-xs text-slate-600">Undergraduate limits (UG cert required)</span>
                        </label>

                        <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${studentType === 'graduate' ? 'bg-blue-50/80 border-[#02adef] shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                            <input type="radio" value="graduate" name="edu" className="hidden"
                                checked={studentType === 'graduate'}
                                onChange={(e) => setStudentType(e.target.value)}
                            />
                            <span className="font-bold text-[#01285e] mb-1">PG Completed</span>
                            <span className="text-xs text-slate-600">Post-graduate (UG + PG certs required)</span>
                        </label>
                    </div>

                    <label className="text-sm font-medium text-slate-600 block mt-6 mb-4 border-t border-slate-100 pt-6">Do you have prior work experience?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${experienceLevel === 'fresher' ? 'bg-green-50/80 border-green-500 shadow-sm' : 'border-slate-100 hover:border-green-200 hover:bg-slate-50'}`}>
                            <input type="radio" value="fresher" name="exp" className="hidden"
                                checked={experienceLevel === 'fresher'}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                            />
                            <span className="font-bold text-[#01285e] mb-1">Fresher</span>
                            <span className="text-xs text-slate-600">No prior experience (No certificate needed)</span>
                        </label>

                        <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${experienceLevel === 'experienced' ? 'bg-green-50/80 border-green-500 shadow-sm' : 'border-slate-100 hover:border-green-200 hover:bg-slate-50'}`}>
                            <input type="radio" value="experienced" name="exp" className="hidden"
                                checked={experienceLevel === 'experienced'}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                            />
                            <span className="font-bold text-[#01285e] mb-1">Experienced</span>
                            <span className="text-xs text-slate-600">Prior positions (Experience letter required)</span>
                        </label>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upload Matrix */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-[#01285e] flex items-center gap-2">
                                <span className="material-icons-round text-[#02adef]">cloud_upload</span>
                                Upload Center
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Select Document Category:</label>
                                <select
                                    value={uploadType}
                                    onChange={e => setUploadType(e.target.value)}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#02adef] transition-colors bg-slate-50"
                                >
                                    {checkList.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleUploadClick}
                                disabled={uploading}
                                className="mt-4 w-full py-4 border-2 border-dashed border-[#02adef]/50 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-2 text-[#01285e] hover:bg-blue-50 transition-colors font-medium cursor-pointer"
                            >
                                {uploading ? (
                                    <div className="w-8 h-8 border-4 border-[#02adef]/30 border-t-[#02adef] rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-icons-round text-3xl text-[#02adef]">backup</span>
                                        <span>Click to browse or Drag & Drop File</span>
                                        <span className="text-xs text-slate-500">JPG, PNG, PDF up to 10MB</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Document Vault */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#01285e] flex items-center gap-2">
                                <span className="material-icons-round text-indigo-500">folder_shared</span>
                                Uploaded Documents
                            </h2>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full">
                                {documents.length} Files
                            </span>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[400px] flex flex-col gap-3">
                            {documents.length === 0 ? (
                                <div className="text-center p-8 text-slate-400 font-medium">No documents uploaded yet.</div>
                            ) : (
                                documents.map((doc: any, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center">
                                                <span className="material-icons-round text-slate-400 text-xl">description</span>
                                                <span className="font-bold text-[#01285e] text-sm">{doc.doc_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide mr-2">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => handlePreviewClick(doc)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                                                    title="View Document"
                                                >
                                                    <span className="material-icons-round text-[18px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    title="Delete Document"
                                                >
                                                    <span className="material-icons-round text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-xs font-semibold">
                                            <div className="px-2 py-1 bg-slate-200/50 rounded flex gap-1 items-center">
                                                <span className="material-icons-round text-[14px]">psychology</span>
                                                OCR AI: {(doc.ai_confidence * 100).toFixed(0)}%
                                            </div>
                                            <div className={`px-2 py-1 rounded flex gap-1 items-center ${doc.ai_status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                doc.ai_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                AI Status: {doc.ai_status}
                                            </div>
                                            <div className={`px-2 py-1 rounded flex gap-1 items-center ${doc.hr_status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                doc.hr_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-200 text-slate-700'
                                                }`}>
                                                HR: {doc.hr_status}
                                            </div>
                                        </div>
                                        {doc.notes && (
                                            <div className="text-xs italic text-red-600 mt-1">HR Note: {doc.notes}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {isComplete && (
                    <div className="bg-white border-2 border-green-500 p-6 rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-between mt-4">
                        <div>
                            <h3 className="font-bold text-lg text-green-700">100% Completion Reached</h3>
                            <p className="text-sm text-slate-500">Your vault contains everything HR needs for final review.</p>
                        </div>
                        <button
                            onClick={submitOnboarding}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-green-500/30 transition-all text-lg flex items-center gap-2"
                        >
                            <span className="material-icons-round">task_alt</span>
                            Submit Documents to HR
                        </button>
                    </div>
                )}
            </main>

            {/* Document Preview Modal Component */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-[#01285e] flex items-center gap-2">
                                <span className="material-icons-round text-[#02adef]">visibility</span>
                                Document Preview: {previewDoc.doc_type}
                            </h2>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors font-bold"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto bg-slate-100 flex justify-center items-center">
                            {previewDoc.loading ? (
                                <div className="text-center text-slate-500 flex flex-col items-center">
                                    <span className="material-icons-round text-6xl opacity-30 animate-spin mb-4">refresh</span>
                                    <p className="font-bold">Fetching High-Res Data from AWS...</p>
                                </div>
                            ) : previewDoc.file_data?.startsWith('data:image/') ? (
                                <img src={previewDoc.file_data} alt={previewDoc.doc_type} className="max-w-full max-h-[80vh] object-contain shadow-md border border-slate-200" />
                            ) : previewDoc.file_data?.startsWith('data:application/pdf') ? (
                                <iframe src={previewDoc.file_data} title={previewDoc.doc_type} className="w-full h-[75vh] shadow-md border border-slate-200" />
                            ) : previewDoc.file_data ? (
                                <div className="text-center text-slate-500">
                                    <span className="material-icons-round text-6xl opacity-30 mb-2">insert_drive_file</span>
                                    <p>File type not directly previewable.</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <span className="material-icons-round text-6xl opacity-30 mb-2">error_outline</span>
                                    <p>No file data found for this document, likely a simulated placeholder.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
} 
