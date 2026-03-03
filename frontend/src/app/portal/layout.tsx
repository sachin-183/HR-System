export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white text-[#01285e] flex flex-col items-center">
            {/* Simple Top Navigation */}
            <nav className="w-full bg-slate-50/50 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#02adef] to-[#01285e] flex items-center gap-2">
                        <img src="/logo.jpg" alt="ShellKode Logo" className="w-8 h-8 object-contain rounded-md" />
                        Candidate Portal
                    </div>
                </div>
            </nav>

            {/* Blob Background */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <main className="w-full max-w-4xl p-6 mt-8">
                {children}
            </main>
        </div>
    );
}
