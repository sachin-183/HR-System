"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== 'hr@shellkode.com' || password !== 'hr@1234') {
      alert("Invalid HR Credentials");
      return;
    }

    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-panel max-w-md w-full p-8 relative overflow-hidden group">

        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[#0295d1]/30"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 transition-all duration-500 group-hover:bg-purple-500/30"></div>

        <div className="relative z-10 text-center mb-8">
          <img src="/logo.jpg" alt="ShellKode Logo" className="w-14 h-14 object-contain mx-auto mb-3 rounded-xl drop-shadow-md" />
          <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] bg-gradient-to-br from-[#01285e] to-blue-200 bg-clip-text text-transparent">
            HR Authorization
          </h2>
          <p className="text-slate-600 mt-2 text-sm">Access the smart recruitment platform</p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">email</span>
              <input
                type="email"
                id="email"
                required
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "3rem" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">lock</span>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "3rem" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-4 text-lg font-semibold relative overflow-hidden transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="material-icons-round animate-spin">refresh</span> Authenticating...
              </span>
            ) : (
              "Secure Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
