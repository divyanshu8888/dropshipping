import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import { useAuth } from '../src/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Email:', formData.email);
    console.log('Password length:', formData.password.length);
    console.log('Login function from useAuth:', typeof login);
    console.log('Login function:', login);
    console.log('About to call login function...');
    
    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (!result.success) {
        setErrors({ submit: result.error || 'Login failed' });
      } else {
        console.log('Login successful, should redirect now');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    }
  };

  return (
    <>
      <Head>
        <title>Login - Uniti</title>
        <meta name="description" content="Login to your Uniti account" />
      </Head>

      <div className="min-h-screen bg-bg-base relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-violet/20 to-accent-cyan/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />

        <div className="flex items-center justify-center min-h-screen py-12 pt-28 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent-blue via-accent-violet to-accent-cyan rounded-3xl flex items-center justify-center shadow-metallic mb-8">
                <span className="text-white text-3xl font-bold">✨</span>
              </div>
              <h2 className="text-5xl font-bold text-text-base mb-4">
                Welcome Back
              </h2>
              <p className="text-gray-700 text-xl font-medium">
                Sign in to your account to continue
              </p>
              <p className="mt-6 text-base text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-bold text-emerald-600 hover:text-cyan-600 transition-colors duration-300 hover:underline">
                  Create one now
                </Link>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pl-12 pr-4 py-4 border border-emerald-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white hover:border-emerald-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full pl-12 pr-4 py-4 border border-cyan-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50/50 transition-all duration-300 hover:bg-white focus:bg-white hover:border-cyan-300"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </div>

                {(errors.submit || error) && (
                  <div className="mt-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/60 rounded-xl">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-600 font-semibold">{errors.submit || error}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center py-5 px-8 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold">Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-3 text-xl">🎯</span>
                        <span className="font-bold">Sign In</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-cyan-600 font-semibold transition-colors duration-300 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
