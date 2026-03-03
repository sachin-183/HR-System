"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OnboardingLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/onboarding/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('onboarding_candidate_id', data.candidate_id.toString());
                localStorage.setItem('onboarding_candidate_name', data.name);
                router.push('/onboarding/dashboard');
            } else {
                setError('Invalid Email or Temporary Password. Please check your latest Offer email.');
            }
        } catch (err) {
            setError('System error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-200 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-slate-200 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <main className="max-w-md w-full relative z-10 glass-panel p-8 md:p-12 animate-slide-up flex flex-col items-center">
                <div className="mb-8 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <img src="/logo.jpg" alt="ShellKode Logo" className="w-12 h-12 object-contain rounded-xl shadow-sm drop-shadow-md" />
                        <h1 className="text-3xl font-extrabold text-[#01285e] tracking-tight font-[family-name:var(--font-heading)]">
                            ShellKode
                        </h1>
                    </div>
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Onboarding Portal</h2>
                    <p className="text-sm text-slate-500">
                        Enter the temporary credentials that were sent to your email to begin your journey.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex gap-3 text-left w-full">
                        <span className="material-icons-round">error_outline</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm tracking-wide font-semibold text-[#01285e]">Candidate Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="applicant@example.com"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200/60 bg-white/50 focus:bg-white focus:border-[#02adef] outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm tracking-wide font-semibold text-[#01285e]">Temporary Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200/60 bg-white/50 focus:bg-white focus:border-[#02adef] outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] bg-gradient-to-r from-[#01285e] to-blue-700 hover:shadow-blue-500/25 hover:to-blue-600 text-white disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign In to Portal
                                <span className="material-icons-round text-[1.2rem]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-slate-500">
                    <p>Powered by ShellKode Smart HR Automation</p>
                </div>
            </main>
        </div>
    );
} 
