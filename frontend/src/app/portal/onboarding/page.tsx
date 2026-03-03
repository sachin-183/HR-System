'use client';

import { useState } from 'react';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);

    // Personal details
    const [applicant, setApplicant] = useState({ name: 'John Doe', email: 'john.doe@example.com', phone: '', address: '', studentType: 'graduate' });

    // Documents
    const [docs, setDocs] = useState<Record<string, File | null>>({
        photo: null,
        bankDetails: null,
        aadhar: null,
        pan: null,
        mark10: null,
        mark12: null,
        ugMark: null,
        pgMark: null
    });

    const handleFileSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDocs({ ...docs, [key]: e.target.files[0] });
        }
    };

    const handleNextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <header className="text-center">
                <span className="material-icons-round text-5xl text-[#02adef] mb-2">assignment_ind</span>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#02adef] to-[#01285e]">
                    Candidate Onboarding
                </h1>
                <p className="text-slate-600 mt-2 max-w-lg mx-auto">
                    Welcome to the HR Recruitment portal! Please complete your profile and upload your documents for Verification.
                </p>
            </header>

            {/* Stepper UI */}
            <div className="flex items-center justify-between max-w-3xl mx-auto mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -z-10 -translate-y-1/2"></div>

                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono transition-all
                            ${step > num ? 'bg-green-500 text-[#01285e] shadow-[0_0_15px_#22c55e]' :
                                step === num ? 'bg-[#02adef] text-[#01285e] shadow-[0_4px_12px_#2563eb66] border-2 border-blue-400' :
                                    'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                            {step > num ? <span className="material-icons-round text-lg">check</span> : num}
                        </div>
                        <span className={`text-xs uppercase tracking-wider font-semibold 
                            ${step >= num ? 'text-[#01285e]' : 'text-slate-600'}`}>
                            {num === 1 ? 'Personal' : num === 2 ? 'Education' : num === 3 ? 'Documents' : 'Status'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="glass-panel p-8 max-w-3xl mx-auto shadow-2xl">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-200 pb-2">1. Personal Information Review</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-sm font-medium text-slate-600">Full Name</label>
                                <input type="text" className="input-field pointer-events-none opacity-80" value={applicant.name} readOnly />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-sm font-medium text-slate-600">Email Address</label>
                                <input type="email" className="input-field pointer-events-none opacity-80" value={applicant.email} readOnly />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-sm font-medium text-slate-600">Contact Number</label>
                                <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium text-slate-600">Current Address</label>
                                <textarea className="input-field h-24" placeholder="Enter your full residential address..."></textarea>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button className="btn btn-primary" onClick={handleNextStep}>Save & Continue</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-200 pb-2">2. Educational Background</h2>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-600 block mb-2">What is your current highest education level?</label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className={`flex flex-col p-4 rounded-xl border border-slate-200 cursor-pointer transition-all ${applicant.studentType === 'college' ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-[#02adef]/20' : 'bg-slate-50/50 hover:bg-[#02adef]/5'}`}>
                                    <input type="radio" value="college" name="edu" className="hidden"
                                        checked={applicant.studentType === 'college'}
                                        onChange={(e) => setApplicant({ ...applicant, studentType: e.target.value })}
                                    />
                                    <span className="font-bold text-[#01285e] mb-1">College Student</span>
                                    <span className="text-xs text-slate-600">Currently studying (10th & 12th required)</span>
                                </label>

                                <label className={`flex flex-col p-4 rounded-xl border border-slate-200 cursor-pointer transition-all ${applicant.studentType === 'ug' ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-[#02adef]/20' : 'bg-slate-50/50 hover:bg-[#02adef]/5'}`}>
                                    <input type="radio" value="ug" name="edu" className="hidden"
                                        checked={applicant.studentType === 'ug'}
                                        onChange={(e) => setApplicant({ ...applicant, studentType: e.target.value })}
                                    />
                                    <span className="font-bold text-[#01285e] mb-1">UG Completed</span>
                                    <span className="text-xs text-slate-600">Undergraduate limits (UG cert required)</span>
                                </label>

                                <label className={`flex flex-col p-4 rounded-xl border border-slate-200 cursor-pointer transition-all ${applicant.studentType === 'graduate' ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-[#02adef]/20' : 'bg-slate-50/50 hover:bg-[#02adef]/5'}`}>
                                    <input type="radio" value="graduate" name="edu" className="hidden"
                                        checked={applicant.studentType === 'graduate'}
                                        onChange={(e) => setApplicant({ ...applicant, studentType: e.target.value })}
                                    />
                                    <span className="font-bold text-[#01285e] mb-1">PG Completed</span>
                                    <span className="text-xs text-slate-600">Post-graduate (UG + PG certs required)</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between border-t border-slate-200 mt-6 pt-6">
                            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                            <button className="btn btn-primary" onClick={handleNextStep}>Save Selection</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-200 pb-2">3. Document Uploads</h2>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-300 mb-6 flex gap-3 text-sm font-medium">
                            <span className="material-icons-round">folder_special</span>
                            <p>Upload files below. Accepted formats: PDF, JPG, PNG (Max 5MB each). Required fields are marked with *</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Standard Required Docs for Everyone */}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Passport Size Photo *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('photo', e)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Bank Passbook Details *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('bankDetails', e)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Aadhar Card *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('aadhar', e)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">PAN Card *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('pan', e)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">10th Mark Sheet *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('mark10', e)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">12th Mark Sheet *</label>
                                <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-[#02adef] hover:file:bg-blue-500/20 input-field p-2" onChange={(e) => handleFileSelect('mark12', e)} />
                            </div>

                            {/* Conditional Doc: UG */}
                            {(applicant.studentType === 'ug' || applicant.studentType === 'graduate') && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-purple-300">UG Degree Certificate *</label>
                                    <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-[#01285e] hover:file:bg-purple-500/20 input-field p-2 border-purple-500/30" onChange={(e) => handleFileSelect('ugMark', e)} />
                                </div>
                            )}

                            {/* Conditional Doc: PG */}
                            {applicant.studentType === 'graduate' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-purple-300">PG Degree Certificate *</label>
                                    <input type="file" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-[#01285e] hover:file:bg-purple-500/20 input-field p-2 border-purple-500/30" onChange={(e) => handleFileSelect('pgMark', e)} />
                                </div>
                            )}
                        </div>

                        <div className="pt-6 mt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-xs text-slate-600 italic">By clicking complete, you verify all files are accurate.</span>
                            <div className="flex gap-4">
                                <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                                <button className="btn bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30 px-8" onClick={handleNextStep}>
                                    Complete Uploads <span className="material-icons-round text-sm ml-1">cloud_done</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {step === 4 && (
                    <div className="text-center space-y-6 py-6 animate-fade-in relative">
                        <div className="absolute inset-0 blob blob-1 !opacity-20 pointer-events-none"></div>
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500/30">
                            <span className="material-icons-round text-5xl text-green-400">task_alt</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#01285e]">HR Onboarding Dashboard Updated</h2>
                        <p className="text-slate-600 max-w-sm mx-auto">
                            All your required documents have been uploaded securely. You can now relax while the HR team verifies your background and documents.
                        </p>
                        <div className="bg-[#02adef]/50 p-6 rounded-lg max-w-sm mx-auto shadow-inner border border-slate-100 space-y-2 mt-6 text-left">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-600">Status</span>
                                <span className="text-sm font-bold text-yellow-400">Verification Pending</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-600">Submission Date</span>
                                <span className="text-sm font-bold text-slate-200">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-600">Uploaded Items</span>
                                <span className="text-sm font-bold text-slate-200">
                                    {Object.values(docs).filter(v => v !== null).length} files
                                </span>
                            </div>
                        </div>
                        <div className="pt-8">
                            <a href="/portal/assessment" className="text-[#02adef] hover:text-blue-300 underline underline-offset-4 text-sm font-medium transition-colors">
                                Return to Candidate Portal Dashboard
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
