import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { canAccessAdminDashboard } from '../lib/permissions';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

// Clean Uniti Logo Component
const UnitiLogo = () => {
    return (
        <div className="logo" aria-label="Uniti – Where ideas unite">
            {/* Optional logo image */}
            <img 
                src="/images/logo/logo2.1.png" 
                alt="Uniti Logo" 
                className="logo-icon"
            />
            <span className="logo-text">Uniti</span>
        </div>
    );
};

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const adminMenuRef = useRef<HTMLDivElement | null>(null);
    const isAdminUser = canAccessAdminDashboard(user?.role || '');
    const displayName = user?.name || (user?.email ? user.email.split('@')[0] : undefined) || 'Account';

    const handleLogout = () => {
        setIsAdminMenuOpen(false);
        logout();
    };

    useEffect(() => {
        if (!isAdminMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
                setIsAdminMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAdminMenuOpen]);

    return (
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
            {/* Soft glow divider */}
            <div className="absolute left-0 right-0 top-[100%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="w-full px-6 md:px-40 flex items-center justify-between" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
                <div className="flex items-center">
                    <Link href="/" className="flex items-center group overflow-visible">
                        {/* UnitiLogo handles both logo and text for left corner */}
                        <UnitiLogo />
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/freelancers" className="relative text-white/75 hover:text-white transition-all duration-300 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-2 py-1 text-sm font-medium">
                        Freelancers
                    </Link>
                    <Link href="/products" className="relative text-white/75 hover:text-white transition-all duration-300 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-2 py-1 text-sm font-medium">
                        Products
                    </Link>
                    
                    {/* Role-specific Dashboard Links */}
                    {isAdminUser && (
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:shadow-purple-500/40 hover:-translate-y-[1px]"
                        >
                            <span className="text-sm">🧭</span>
                            Admin Command
                        </Link>
                    )}
                    {user ? (
                        <div className="relative ml-4" ref={adminMenuRef}>
                            <button
                                onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur transition hover:border-indigo-400/60 hover:bg-white/10"
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-inner shadow-black/30 ${
                                        user.role === 'ADMIN'
                                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                            : user.role === 'TEAM_MEMBER'
                                            ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
                                            : user.role === 'FREELANCER'
                                            ? 'bg-gradient-to-br from-blue-500 to-sky-500'
                                            : user.role === 'CLIENT'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                            : 'bg-gradient-to-br from-slate-500 to-slate-600'
                                    }`}
                                >
                                        {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-semibold text-white/90">{displayName}</span>
                                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <svg
                                    className={`h-4 w-4 text-white/60 transition ${isAdminMenuOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isAdminMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-lg">
                                    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-inner ${
                                                user.role === 'ADMIN'
                                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                    : user.role === 'TEAM_MEMBER'
                                                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
                                                    : user.role === 'FREELANCER'
                                                    ? 'bg-gradient-to-br from-blue-500 to-sky-500'
                                                    : user.role === 'CLIENT'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
                                            }`}
                                        >
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/90">{displayName}</p>
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                                                {user.role?.replace('_', ' ')}
                                            </p>
                                </div>
                            </div>
                                    {/* Freelancer My Dashboard inside profile menu */}
                                    {user?.role === 'FREELANCER' && (
                                        <div className="mt-3 space-y-1">
                                            <button
                                                onClick={() => { setIsAdminMenuOpen(false); router.push('/freelancers/dashboard'); }}
                                                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                💼 My Dashboard
                                            </button>
                                        </div>
                                    )}
                                    {/* Client My Dashboard inside profile menu */}
                                    {user?.role === 'CLIENT' && (
                                        <div className="mt-3 space-y-1">
                                            <button
                                                onClick={() => { setIsAdminMenuOpen(false); router.push('/client-dashboard'); }}
                                                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                📋 My Dashboard
                                            </button>
                                        </div>
                                    )}
                                    {/* Admin links */}
                                    {isAdminUser && (
                                        <div className="mt-3 space-y-1">
                                            <button
                                                onClick={() => { setIsAdminMenuOpen(false); router.push('/admin'); }}
                                                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                🧭 Admin Dashboard
                                            </button>
                                            <button
                                                onClick={() => { setIsAdminMenuOpen(false); router.push('/admin/team'); }}
                                                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                👥 Manage Team
                                            </button>
                                            <button
                                                onClick={() => { setIsAdminMenuOpen(false); router.push('/admin/setup'); }}
                                                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                ⚙️ Admin Settings
                                            </button>
                                        </div>
                                    )}
                                    <div className="mt-3 border-t border-white/10 pt-3">
                            <button
                                onClick={handleLogout}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
                            >
                                            ⏏ Logout
                            </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        ) : (
                        <div className="ml-4 flex items-center gap-3">
                            <Link
                                href="/login"
                                className="relative text-white/75 hover:text-white transition-all duration-300 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-2 py-1 text-sm font-medium"
                            >
                                Log in
                            </Link>
                        </div>
                        )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-text-mute hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden pb-4 border-t border-white/10">
                        <nav className="flex flex-col space-y-2 pt-4">
                            <Link href="/" className="text-text-soft hover:text-text-base hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Home
                            </Link>
                            <Link href="/freelancers" className="text-text-soft hover:text-text-base hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Freelancers
                            </Link>
                            <Link href="/products" className="text-text-soft hover:text-text-base hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Products
                            </Link>
                        
                        {/* Role-specific Dashboard Links */}
                        {canAccessAdminDashboard(user?.role || '') && (
                            <Link href="/admin" className="text-text-soft hover:text-accent-violet hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center">
                                <span className="mr-2">🧭</span>
                                Admin Dashboard
                            </Link>
                        )}
                        {user?.role === 'FREELANCER' && (
                            <Link href="/freelancers/dashboard" className="text-text-soft hover:text-accent-blue hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center">
                                <span className="mr-2">💼</span>
                                My Dashboard
                            </Link>
                        )}
                        {user?.role === 'CLIENT' && (
                            <Link href="/client-dashboard" className="text-text-soft hover:text-accent-cyan hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center">
                                <span className="mr-2">📋</span>
                                My Dashboard
                            </Link>
                        )}
                        
                        {user ? (
                            <div className="pt-2 border-t border-white/10">
                                <div className="flex items-center space-x-2 px-4 py-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        user.role === 'ADMIN' ? 'bg-gradient-to-br from-accent-violet to-purple-600' :
                                        user.role === 'TEAM_MEMBER' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                                        user.role === 'FREELANCER' ? 'bg-gradient-to-br from-accent-blue to-blue-600' :
                                        user.role === 'CLIENT' ? 'bg-gradient-to-br from-accent-cyan to-green-600' :
                                        'bg-gradient-to-br from-accent-blue to-accent-cyan'
                                    }`}>
                                        <span className="text-white text-sm font-bold">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text-base">{displayName}</span>
                                        <span className="text-xs text-text-mute capitalize">{user.role?.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left text-text-soft hover:text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-white/10 space-y-2">
                                <Link href="/login" className="text-text-soft hover:text-text-base hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                    Log in / Sign up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;