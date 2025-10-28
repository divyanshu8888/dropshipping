import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { canAccessAdminDashboard } from '../lib/permissions';
import { useAuth } from '../contexts/AuthContext';

// Simple Uniti Logo Component
const UnitiLogo = () => {
    return (
        <div
            className="relative w-full h-full flex items-center justify-center select-none"
            aria-label="Uniti – Where ideas unite"
        >
            <span
                className="text-xl font-bold tracking-normal"
                style={{
                    background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'Space Grotesk, sans-serif'
                }}
            >
                Uniti
            </span>
        </div>
    );
};

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    // Debug logging
    console.log('Header - user:', user);
    console.log('Header - user type:', typeof user);
    console.log('Header - user is null:', user === null);
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        console.log('Header - localStorage user:', storedUser);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Header - parsed localStorage user:', parsedUser);
            } catch (e) {
                console.log('Header - Error parsing localStorage user:', e);
            }
        }
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Debug effect to track user state changes
    useEffect(() => {
        console.log('Header - User state changed:', user);
    }, [user]);

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
            {/* Soft glow divider */}
            <div className="absolute left-0 right-0 top-[100%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2 group overflow-visible">
                        <img 
                            src="/images/logo/logo.png" 
                            alt="Uniti Logo" 
                            className="h-10 w-auto group-hover:scale-105 transition-all duration-300 bg-transparent"
                        />
                        <div className="relative w-auto h-12 overflow-visible">
                            <UnitiLogo />
                        </div>
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/freelancers" className="relative text-white/70 hover:text-white transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-1 py-1">
                        Freelancers
                    </Link>
                    <Link href="/products" className="relative text-white/70 hover:text-white transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-1 py-1">
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
                        <div className="flex items-center space-x-3 ml-4">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-bg-surface rounded-xl border border-white/10">
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
                                className="px-4 py-2 text-text-soft hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all duration-200"
                            >
                                Logout
                            </button>
                        </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="relative text-white/70 hover:text-white transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r from-cyan-400 to-violet-400 hover:after:w-full after:transition-all after:duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-1 py-1">
                                    Log in
                                </Link>
                                <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white px-5 py-2.5 font-semibold text-sm shadow-[0_0_15px_rgba(96,165,250,0.35)] hover:shadow-[0_0_25px_rgba(96,165,250,0.45)] hover:scale-[1.03] transition-all duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none">
                                    Get started
                                    <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
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