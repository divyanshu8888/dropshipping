import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const t = router.query.token;
    if (typeof t === 'string' && t.length > 0) {
      setToken(t);
    } else {
      setStatus('invalid');
    }
  }, [router.isReady, router.query.token]);

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: 'bg-white/10', width: '0%' };
    if (password.length < 8) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: 'bg-orange-500', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-yellow-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const strength = passwordStrength();

  return (
    <>
      <Head>
        <title>Reset Password — Unitiv</title>
        <meta name="description" content="Set a new password for your Unitiv account." />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-[#0B0C0F] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-56 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[380px] w-[380px] translate-x-1/3 translate-y-1/3 rounded-full bg-violet-500/20 blur-[140px]" />
        </div>

        <Header />

        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-md flex-col items-center justify-center px-6 py-20">
          <div className="w-full rounded-[28px] border border-white/8 bg-white/[0.05] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">

            {status === 'invalid' && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-400/30">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Invalid link</h1>
                <p className="mt-3 text-sm text-white/55">This reset link is missing or malformed. Please request a new one.</p>
                <Link
                  href="/forgot-password"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 text-sm font-bold text-white"
                >
                  Request new link
                </Link>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                  <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Password updated!</h1>
                <p className="mt-3 text-sm text-white/55">Your password has been changed. You can now log in with your new password.</p>
                <Link
                  href="/login"
                  className="mt-8 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-bold text-white"
                >
                  Go to login
                </Link>
              </div>
            )}

            {(status === 'idle' || status === 'loading' || status === 'error') && (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                    <svg className="h-7 w-7 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Set new password</h1>
                  <p className="mt-2 text-sm text-white/55">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-white/70">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="block w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 pr-12 text-sm text-white placeholder:text-white/35 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        {strength.label && (
                          <p className="text-xs text-white/50">{strength.label}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label htmlFor="confirm" className="block text-sm font-semibold text-white/70">
                      Confirm password
                    </label>
                    <input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      className={`block w-full rounded-2xl border bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 transition ${
                        confirm && confirm !== password
                          ? 'border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20'
                          : confirm && confirm === password
                          ? 'border-emerald-400/40 focus:border-emerald-400/60 focus:ring-emerald-400/20'
                          : 'border-white/10 focus:border-cyan-400/60 focus:ring-cyan-400/30'
                      }`}
                    />
                    {confirm && confirm !== password && (
                      <p className="text-xs text-red-400">Passwords don't match</p>
                    )}
                  </div>

                  {status === 'error' && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Updating…
                      </>
                    ) : (
                      'Update password'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    ← Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
