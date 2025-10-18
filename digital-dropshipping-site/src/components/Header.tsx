import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        // Check for logged in user
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
                : 'bg-white/80 backdrop-blur-sm'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600">
                                TalentHub Pro
                            </span>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-2">
                        <Link href="/" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
                            Home
                        </Link>
                        <Link href="/freelancers" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
                            Freelancers
                        </Link>
                        <Link href="/products" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
                            Products
                        </Link>
                        
                        {user ? (
                            <div className="flex items-center space-x-3 ml-4">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 ml-4">
                                <Link href="/login" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                                    Login
                                </Link>
                                <Link href="/signup" className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                    <span className="mr-2">🚀</span>
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-700 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition-all duration-200"
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
                    <div className="lg:hidden pb-4 border-t border-gray-100">
                        <nav className="flex flex-col space-y-2 pt-4">
                            <Link href="/" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Home
                            </Link>
                            <Link href="/freelancers" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Freelancers
                            </Link>
                            <Link href="/products" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                Products
                            </Link>
                            
                            {user ? (
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center space-x-2 px-4 py-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <Link href="/login" className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="block text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;