"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/dashboard', icon: 'dashboard' },
        { name: 'Job Postings', href: '/dashboard/jobs', icon: 'work' },
        { name: 'Pipeline', href: '/dashboard/pipeline', icon: 'view_kanban' },
        { name: 'Onboarding Monitor', href: '/dashboard/onboarding', icon: 'verified_user' },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] flex-shrink-0 border-r border-slate-200 bg-white/60 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 flex items-center gap-3">
                    <img src="/logo.jpg" alt="ShellKode Logo" className="w-8 h-8 object-contain rounded-md drop-shadow-sm" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[#01285e] to-blue-200 bg-clip-text text-transparent font-[family-name:var(--font-heading)] truncate">
                        HR System
                    </h1>
                </div>

                <nav className="flex-1 flex flex-col gap-2 px-4 mt-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-[#02adef]/20 text-[#01285e] border-l-4 border-blue-500'
                                    : 'text-slate-600 hover:text-[#01285e] hover:bg-[#02adef]/5 border-l-4 border-transparent'
                                    }`}
                            >
                                <span className={`material-icons-round ${isActive ? 'text-[#02adef]' : ''}`}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-[#01285e] shadow-lg shadow-[#02adef]/20 font-[family-name:var(--font-heading)]">
                        HR
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-semibold text-[#01285e] truncate">Admin User</span>
                        <Link href="/" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                            Sign Out
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative p-8">
                {children}
            </main>
        </div>
    );
}
