import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../src/components/Header';

// Why: lightweight client-side email format check before hitting the API
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState(''); // Why: inline field-level validation message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Why: validate format client-side before the API round trip
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('sent');
      } else {
        // Why: surface the API's { error } message with a friendly fallback
        setErrorMsg(data.error || 'Something went wrong — please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Unitiv</title>
        {/* Why: 150-160 char description; noindex because auth pages should stay out of search */}
        <meta
          name="description"
          content="Forgot your Unitiv password? Enter your account email and we will send you a secure reset link so you can regain access to your projects within minutes."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-[#0B0C0F] text-white">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-56 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[380px] w-[380px] translate-x-1/3 translate-y-1/3 rounded-full bg-violet-500/20 blur-[140px]" />
        </div>

        <Header />

        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-md flex-col items-center justify-center px-6 py-20">
          <div className="w-full rounded-[28px] border border-white/8 bg-white/[0.05] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">

            {status === 'sent' ? (
              /* Success state */
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                  <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  If an account with <span className="font-semibold text-white/85">{email}</span> exists, we&apos;ve sent a password reset link. It expires in 1 hour.
                </p>
                <p className="mt-4 text-xs text-white/40">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  {/* Why: explicit type="button" so it never accidentally submits */}
                  <button
                    type="button"
                    onClick={() => { setStatus('idle'); setEmail(''); }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    try again
                  </button>.
                </p>
                <Link
                  href="/login"
                  className="mt-8 inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                    <svg className="h-7 w-7 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
                  <p className="mt-2 text-sm text-white/55">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-white/70">
                      Email address{' '}
                      <span aria-hidden="true" className="text-rose-400">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => {
                        // Why: inline validation on blur for immediate feedback
                        if (email && !EMAIL_RE.test(email.trim())) {
                          setEmailError('Please enter a valid email address.');
                        } else {
                          setEmailError('');
                        }
                      }}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? 'email-error' : undefined}
                      placeholder="you@example.com"
                      className="block w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
                    />
                    {emailError && (
                      <p id="email-error" className="text-xs font-semibold text-rose-300">{emailError}</p>
                    )}
                  </div>

                  {status === 'error' && (
                    // Why: role="alert" announces API failures to screen readers
                    <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:opacity-90 hover:shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
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
