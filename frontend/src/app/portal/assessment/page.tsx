'use client';

import { useState } from 'react';

export default function AssessmentPage() {
    const [started, setStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="glass-panel text-center p-12">
                <span className="material-icons-round text-6xl text-green-400 mb-4 block animate-bounce">check_circle</span>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                    Assessment Completed
                </h1>
                <p className="text-slate-600 mt-4 max-w-lg mx-auto mb-8">
                    Thank you for completing the technical assessment. Our HR team will review your submission and contact you soon regarding the next steps in the process.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = "/portal/onboarding"}
                >
                    Proceed to Document Onboarding <span className="material-icons-round">arrow_forward</span>
                </button>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="glass-panel p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-[#02adef] mb-6">
                    <span className="material-icons-round text-4xl">quiz</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Technical Assessment</h1>
                <p className="text-slate-700 max-w-xl mx-auto mb-8 leading-relaxed">
                    You have been invited to take the technical assessment for the role.
                    This test includes 3 practical questions and usually takes about 45 minutes to complete.
                    Make sure you have a stable internet connection.
                </p>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-orange-400 mb-8 max-w-md w-full flex items-start gap-3">
                    <span className="material-icons-round">warning</span>
                    <p className="text-sm text-left">Once started, the timer cannot be paused. Ensure you are ready before clicking begin.</p>
                </div>
                <button
                    className="btn btn-primary px-8 py-3 text-lg w-full max-w-xs transition-all shadow-lg shadow-blue-500/30"
                    onClick={() => setStarted(true)}
                >
                    Begin Assessment
                </button>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold">Technical Questionnaire</h2>
                <div className="text-red-400 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full font-mono font-bold">
                    <span className="material-icons-round text-sm">timer</span>
                    45:00
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Q1 */}
                <div className="space-y-3">
                    <label className="block text-slate-700 font-medium">
                        1. Explain the difference between React Server Components and Client Components. When would you use each?
                    </label>
                    <textarea
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Write your answer here..."
                        required
                        value={answers.q1}
                        onChange={e => setAnswers({ ...answers, q1: e.target.value })}
                    />
                </div>

                {/* Q2 */}
                <div className="space-y-3">
                    <label className="block text-slate-700 font-medium">
                        2. How do you handle complex state management in a large-scale frontend application?
                    </label>
                    <textarea
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Write your answer here..."
                        required
                        value={answers.q2}
                        onChange={e => setAnswers({ ...answers, q2: e.target.value })}
                    />
                </div>

                {/* Q3 */}
                <div className="space-y-3">
                    <label className="block text-slate-700 font-medium">
                        3. Describe a time you had to optimize the performance of a web application. What tools did you use?
                    </label>
                    <textarea
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Write your answer here..."
                        required
                        value={answers.q3}
                        onChange={e => setAnswers({ ...answers, q3: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="submit" className="btn btn-primary px-8">Submit Assessment</button>
                </div>
            </form>
        </div>
    );
}
