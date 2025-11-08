import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { canAccessAdminDashboard } from '../lib/permissions';
import { useAuth } from '../contexts/AuthContext';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

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
                    {canAccessAdminDashboard(user?.role || '') && (
                        <Link href="/admin" className="text-text-soft hover:text-accent-violet hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center">
                            <span className="mr-2">🧭</span>
                            Admin Dashboard
                        </Link>
                    )}
                    {user?.role === 'FREELANCER' && (
                        <Link href="/freelancers/dashboard" className="text-text-soft hover:text-accent-blue hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center">
                            <span className="mr-2">💼</span>
                            My Dashboard
                        </Link>
                    )}
                    {user?.role === 'CLIENT' && (
                        <Link href="/client-dashboard" className="text-text-soft hover:text-accent-cyan hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center">
                            <span className="mr-2">📋</span>
                            My Dashboard
                        </Link>
                    )}
                    
                    {user ? (
                        <div className="flex items-center space-x-2 ml-4">
                            <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-bg-surface rounded-xl border border-white/10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    user.role === 'ADMIN' ? 'bg-gradient-to-br from-accent-violet to-purple-600' :
                                    user.role === 'TEAM_MEMBER' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                                    user.role === 'FREELANCER' ? 'bg-gradient-to-br from-accent-blue to-blue-600' :
                                    user.role === 'CLIENT' ? 'bg-gradient-to-br from-accent-cyan to-green-600' :
                                    'bg-gradient-to-br from-accent-blue to-accent-cyan'
                                }`}>
                                    <span className="text-white text-xs font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-text-base">{user.name}</span>
                                    <span className="text-[10px] text-text-mute capitalize">{user.role?.toLowerCase().replace('_', ' ')}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-text-soft hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium transition-all duration-200"
                            >
                                Logout
                            </button>
                        </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="relative text-white/75 hover:text-white transition-all duration-300 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-2 py-1 text-sm font-medium">
                                    Log in
                                </Link>
                                <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white px-5 py-2.5 font-semibold text-sm shadow-[0_6px_18px_-6px_rgba(0,216,255,.35)] hover:shadow-[0_8px_22px_-6px_rgba(0,216,255,.42)] hover:scale-[1.05] transition-all duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none">
                                    Get started
                                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                    </svg>
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
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text-base">{user.name}</span>
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
                                <Link href="/login" className="block text-text-soft hover:text-text-base hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                    Login
                                </Link>
                                <Link href="/signup" className="block text-center px-4 py-3 bg-gradient-to-br from-accent-blue to-accent-cyan text-white rounded-xl text-sm font-medium shadow-metallic hover:shadow-xl transition-all duration-200">
                                    Get Started
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