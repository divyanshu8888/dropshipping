import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import { Eye, EyeOff } from 'lucide-react'; // Why: accessible show/hide password toggles
import { useAuth } from '../src/contexts/AuthContext';
import { loginCopy, signupCopy } from '../src/copy/auth';

type AuthMode = 'login' | 'signup';

// Why: lightweight client-side email format check before hitting the API
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const router = useRouter();
  const { login, loading, error, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client'
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupLoading, setSignupLoading] = useState(false);
  // Why: independent visibility toggles per password field
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const activeCopy = useMemo(() => (mode === 'login' ? loginCopy : signupCopy), [mode]);

  useEffect(() => {
    if (!router.isReady) return;
    const queryMode = router.query.mode === 'signup' ? 'signup' : 'login';
    setMode(queryMode);
  }, [router.isReady, router.query.mode]);

  // If already authenticated, never show login - redirect to role router
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLoginErrors({});
    setSignupErrors({});

    if (!router.isReady) return;
    const { mode: _ignored, ...rest } = router.query;

    if (nextMode === 'signup') {
      router.replace(
        { pathname: router.pathname, query: { ...rest, mode: 'signup' } },
        undefined,
        { shallow: true }
      );
    } else {
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true
      });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Why: field-level validation on submit before calling the API
    const validationErrors: Record<string, string> = {};
    if (!EMAIL_RE.test(loginForm.email.trim())) {
      validationErrors.email = 'Please enter a valid email address.';
    }
    if (!loginForm.password) {
      validationErrors.password = 'Password is required.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setLoginErrors(validationErrors);
      return;
    }

    setLoginErrors({});

    try {
      const result = await login(loginForm.email, loginForm.password);

      if (!result.success) {
        setLoginErrors({ submit: result.error || loginCopy.alerts.invalid });
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setLoginErrors({ submit: loginCopy.alerts.generic });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!signupForm.name.trim()) {
      validationErrors.name = signupCopy.form.fields.nameLabel + ' is required';
    }

    // Why: catch malformed emails client-side before the API round trip
    if (!EMAIL_RE.test(signupForm.email.trim())) {
      validationErrors.email = signupCopy.alerts.invalidEmail;
    }

    if (signupForm.password.length < 6) {
      validationErrors.password = signupCopy.alerts.shortPassword;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setSignupErrors(validationErrors);
      return;
    }

    setSignupErrors({});
    setSignupLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          userType: signupForm.userType === 'freelancer' ? 'FREELANCER' : 'CLIENT'
        })
      });

      const data = await response.json();

      if (response.ok) {
        const loginResult = await login(signupForm.email, signupForm.password);

        if (!loginResult.success) {
          setSignupErrors({ submit: loginResult.error || signupCopy.alerts.generic });
        }
      } else {
        const rawMessage: string = data.error || data.message || '';
        const message: string = rawMessage || signupCopy.alerts.generic;
        let resolved = 'We couldn’t create your account. Please review the details and try again.';

        if (/exists/i.test(message)) {
          resolved = signupCopy.alerts.emailTaken;
        } else if (/valid email/i.test(message)) {
          resolved = signupCopy.alerts.invalidEmail;
        } else if (/password/i.test(message) && /6/i.test(message)) {
          resolved = signupCopy.alerts.shortPassword;
        }

        // Include server-provided detail if present to aid the user
        const detailParts: string[] = [];
        if (rawMessage && resolved !== rawMessage) {
          detailParts.push(rawMessage);
        }
        if (Array.isArray(data.errors)) {
          detailParts.push(...data.errors.map((e: any) => (typeof e === 'string' ? e : JSON.stringify(e))));
        } else if (data.errors && typeof data.errors === 'object') {
          detailParts.push(
            ...Object.entries(data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`),
          );
        }

        setSignupErrors({
          submit: resolved + (detailParts.length ? `\n${detailParts.join('\n')}` : ''),
        });
      }
    } catch (signupError) {
      console.error('Signup error:', signupError);
      setSignupErrors({ submit: signupCopy.alerts.generic });
    } finally {
      setSignupLoading(false);
    }
  };

  const roleOptions: Array<{
    id: 'client' | 'freelancer';
    icon: string;
    title: string;
    subtitle: string;
    gradient: string;
  }> = [
    {
      id: 'client',
      icon: '👤',
      title: signupCopy.form.fields.roleOptions.client,
      subtitle: 'Looking for services',
      gradient: 'from-brand-b via-brand-c to-brand-a'
    },
    {
      id: 'freelancer',
      icon: '💼',
      title: signupCopy.form.fields.roleOptions.freelancer,
      subtitle: 'Offering services',
      gradient: 'from-brand-a via-brand-b to-brand-c'
    }
  ];

  const isLogin = mode === 'login';
  const isProcessing = isLogin ? loading : signupLoading;
  const highlights = loginCopy.highlights;

  return (
    <>
      <Head>
        <title>{activeCopy.seo.title}</title>
        <meta name="description" content={activeCopy.seo.description} />
        {/* Why: auth pages must not be indexed by search engines */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-superhuman text-text-base">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient opacity-80"></div>
          <div className="absolute -top-56 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-b/20 blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/3 translate-y-1/3 rounded-full bg-brand-c/25 blur-[140px]"></div>
          <div className="absolute top-1/3 -left-40 h-72 w-72 rounded-full border border-white/10 opacity-40"></div>
        </div>

        <Header />

        <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 md:px-12 lg:pt-32">
          <div className="grid items-start gap-16 lg:grid-cols-[1.1fr_1fr]">
            <section className="flex min-h-[26rem] flex-col gap-10">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-text-soft backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-brand-a"></span>
                  {activeCopy.hero.badge}
                </span>
                <h1 className="font-display text-3xl leading-snug text-text-base sm:text-4xl lg:text-5xl">
                  {activeCopy.hero.titleLead}{' '}
                  <span className="bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-clip-text text-transparent font-bold">
                    {activeCopy.hero.titleStrong}
                  </span>
                </h1>
                <p className="max-w-xl text-base text-text-soft sm:text-lg">
                  {activeCopy.hero.subcopy}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="group rounded-3xl border border-white/5 bg-white/5 p-6 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-b/40 hover:bg-white/10"
                  >
                    <div className="mb-4 text-2xl">{highlight.icon}</div>
                    <h3 className="text-base font-semibold text-text-base sm:text-lg">{highlight.title}</h3>
                    <p className="mt-2 text-sm text-text-soft sm:text-base">{highlight.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-mute sm:text-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <span className="text-xs font-semibold text-text-base sm:text-sm">{loginCopy.trust.uptimePill}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-c"></span>
                  <span>{loginCopy.trust.enterprisePill}</span>
                </div>
                <p>{loginCopy.trust.caption}</p>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-brand-b/25 via-brand-c/15 to-brand-a/5 blur-3xl"></div>

              <form
                onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
                className="space-y-8 rounded-[28px] border border-white/8 bg-white/5 p-10 shadow-card backdrop-blur-xl"
              >
                <div className="flex items-center justify-center gap-2 rounded-full bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isLogin
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'text-text-soft hover:text-text-base'
                    }`}
                  >
                    {loginCopy.form.submit}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      !isLogin
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'text-text-soft hover:text-text-base'
                    }`}
                  >
                    {signupCopy.form.submit}
                  </button>
                </div>

                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-bold text-text-base sm:text-3xl">{activeCopy.form.heading}</h2>
                  {isLogin ? (
                    <p className="text-xs text-text-soft sm:text-sm">
                      {loginCopy.form.noAccount}{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200"
                      >
                        {loginCopy.form.createCta}
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-text-soft sm:text-sm">
                      {signupCopy.form.haveAccount}{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200"
                      >
                        {signupCopy.form.loginCta}
                      </button>
                    </p>
                  )}
                </div>

                {isLogin ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="login-email" className="block text-sm font-semibold text-text-soft">
                        {loginCopy.form.fields.emailLabel}{' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        onBlur={() => {
                          // Why: inline validation on blur for immediate feedback
                          if (loginForm.email && !EMAIL_RE.test(loginForm.email.trim())) {
                            setLoginErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
                          } else {
                            setLoginErrors(({ email: _removed, ...rest }) => rest);
                          }
                        }}
                        aria-invalid={Boolean(loginErrors.email)}
                        aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
                        className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-b focus:outline-none focus:ring-2 focus:ring-brand-b/60 sm:text-base"
                        placeholder={loginCopy.form.fields.emailPlaceholder}
                      />
                      {loginErrors.email && (
                        <p id="login-email-error" className="text-xs font-semibold text-red-300">{loginErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="login-password" className="block text-sm font-semibold text-text-soft">
                        {loginCopy.form.fields.passwordLabel}{' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          maxLength={128}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          onBlur={() => {
                            // Why: surface missing password on blur, not only on submit
                            if (!loginForm.password) {
                              setLoginErrors((prev) => ({ ...prev, password: 'Password is required.' }));
                            } else {
                              setLoginErrors(({ password: _removed, ...rest }) => rest);
                            }
                          }}
                          aria-invalid={Boolean(loginErrors.password)}
                          aria-describedby={loginErrors.password ? 'login-password-error' : undefined}
                          className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-14 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-c focus:outline-none focus:ring-2 focus:ring-brand-c/60 sm:text-base"
                          placeholder={loginCopy.form.fields.passwordPlaceholder}
                        />
                        {/* Why: 44px show/hide toggle for password visibility */}
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((v) => !v)}
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-text-mute transition-colors hover:text-text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                        >
                          {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {loginErrors.password && (
                        <p id="login-password-error" className="text-xs font-semibold text-red-300">{loginErrors.password}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="signup-name" className="block text-sm font-semibold text-text-soft">
                        {signupCopy.form.fields.nameLabel}{' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <input
                        id="signup-name"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        onBlur={() => {
                          // Why: inline validation on blur for immediate feedback
                          if (!signupForm.name.trim()) {
                            setSignupErrors((prev) => ({ ...prev, name: signupCopy.form.fields.nameLabel + ' is required' }));
                          } else {
                            setSignupErrors(({ name: _removed, ...rest }) => rest);
                          }
                        }}
                        aria-invalid={Boolean(signupErrors.name)}
                        aria-describedby={signupErrors.name ? 'signup-name-error' : undefined}
                        className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-b focus:outline-none focus:ring-2 focus:ring-brand-b/60 sm:text-base"
                        placeholder={signupCopy.form.fields.namePlaceholder}
                      />
                      {signupErrors.name && (
                        <p id="signup-name-error" className="text-xs font-semibold text-red-300">{signupErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="block text-sm font-semibold text-text-soft">
                        {signupCopy.form.fields.emailLabel}{' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        onBlur={() => {
                          // Why: inline validation on blur for immediate feedback
                          if (signupForm.email && !EMAIL_RE.test(signupForm.email.trim())) {
                            setSignupErrors((prev) => ({ ...prev, email: signupCopy.alerts.invalidEmail }));
                          } else {
                            setSignupErrors(({ email: _removed, ...rest }) => rest);
                          }
                        }}
                        aria-invalid={Boolean(signupErrors.email)}
                        aria-describedby={signupErrors.email ? 'signup-email-error' : undefined}
                        className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-b focus:outline-none focus:ring-2 focus:ring-brand-b/60 sm:text-base"
                        placeholder={signupCopy.form.fields.emailPlaceholder}
                      />
                      {signupErrors.email && (
                        <p id="signup-email-error" className="text-xs font-semibold text-red-300">{signupErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="block text-sm font-semibold text-text-soft">
                        {signupCopy.form.fields.passwordLabel}{' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="signup-password"
                          name="password"
                          type={showSignupPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          maxLength={128}
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          onBlur={() => {
                            // Why: inline validation on blur for immediate feedback
                            if (signupForm.password && signupForm.password.length < 6) {
                              setSignupErrors((prev) => ({ ...prev, password: signupCopy.alerts.shortPassword }));
                            } else {
                              setSignupErrors(({ password: _removed, ...rest }) => rest);
                            }
                          }}
                          aria-invalid={Boolean(signupErrors.password)}
                          aria-describedby={signupErrors.password ? 'signup-password-error' : undefined}
                          className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-14 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-c focus:outline-none focus:ring-2 focus:ring-brand-c/60 sm:text-base"
                          placeholder={signupCopy.form.fields.passwordPlaceholder}
                        />
                        {/* Why: 44px show/hide toggle for password visibility */}
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((v) => !v)}
                          aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-text-mute transition-colors hover:text-text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                        >
                          {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {signupErrors.password && (
                        <p id="signup-password-error" className="text-xs font-semibold text-red-300">{signupErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-confirm" className="block text-sm font-semibold text-text-soft">
                        {signupCopy.form.fields.passwordLabel} (confirm){' '}
                        <span aria-hidden="true" className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="signup-confirm"
                          name="confirmPassword"
                          type={showSignupConfirm ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          maxLength={128}
                          value={signupForm.confirmPassword}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                          }
                          onBlur={() => {
                            // Why: inline validation on blur for immediate feedback
                            if (signupForm.confirmPassword && signupForm.confirmPassword !== signupForm.password) {
                              setSignupErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                            } else {
                              setSignupErrors(({ confirmPassword: _removed, ...rest }) => rest);
                            }
                          }}
                          aria-invalid={Boolean(signupErrors.confirmPassword)}
                          aria-describedby={signupErrors.confirmPassword ? 'signup-confirm-error' : undefined}
                          className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-14 text-sm text-text-base shadow-inner drop-shadow-md placeholder:text-text-mute/70 focus:border-brand-c focus:outline-none focus:ring-2 focus:ring-brand-c/60 sm:text-base"
                          placeholder="Confirm your password"
                        />
                        {/* Why: 44px show/hide toggle for password visibility */}
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirm((v) => !v)}
                          aria-label={showSignupConfirm ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-text-mute transition-colors hover:text-text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                        >
                          {showSignupConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {signupErrors.confirmPassword && (
                        <p id="signup-confirm-error" className="text-xs font-semibold text-red-300">
                          {signupErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <span className="block text-sm font-semibold text-text-soft">
                        {signupCopy.form.fields.roleLabel}
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        {roleOptions.map((option) => {
                          const isActive = signupForm.userType === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSignupForm({ ...signupForm, userType: option.id })}
                              className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                                isActive
                                  ? 'border-transparent bg-white text-slate-900 shadow-xl shadow-brand-b/30 ring-2 ring-brand-b/60'
                                  : 'border-white/10 bg-white/5 text-text-soft hover:border-white/20 hover:bg-white/10 hover:text-text-base'
                              }`}
                            >
                              <div
                                className={`pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-60 ${
                                  isActive ? 'opacity-80' : ''
                                } bg-gradient-to-br ${option.gradient}`}
                              ></div>
                              <div className="relative z-10 flex h-full flex-col items-center gap-3 px-4 py-5">
                                <div
                                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                                    isActive
                                      ? `bg-gradient-to-br ${option.gradient}`
                                      : 'bg-white/10 text-text-soft group-hover:text-text-base'
                                  }`}
                                >
                                  {option.icon}
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-semibold sm:text-base">{option.title}</p>
                                  <p
                                    className={`text-xs font-medium transition-colors duration-300 ${
                                      isActive ? 'text-slate-500' : 'text-text-mute'
                                    }`}
                                  >
                                    {option.subtitle}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {isLogin ? (
                  (loginErrors.submit || error) && (
                    // Why: role="alert" announces API failures to screen readers
                    <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
                      {loginErrors.submit || error || loginCopy.alerts.generic}
                    </div>
                  )
                ) : (
                  signupErrors.submit && (
                    // Why: role="alert" announces API failures to screen readers
                    <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
                      <p className="font-semibold text-red-100">We couldn&apos;t create your account</p>
                      <p className="mt-1 whitespace-pre-line">{signupErrors.submit}</p>
                    </div>
                  )
                )}

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-a via-brand-b to-brand-c px-6 py-4 text-sm font-semibold text-slate-900 shadow-lg shadow-brand-b/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-c/40 focus:outline-none focus:ring-4 focus:ring-brand-b/40 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="h-5 w-5 animate-spin text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isLogin ? loginCopy.form.submitting : signupCopy.form.submitting}
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-lg">↗</span>
                        <span className="text-sm sm:text-base">
                          {isLogin ? loginCopy.form.submit : signupCopy.form.submit}
                        </span>
                      </>
                    )}
                  </button>

                  {isLogin ? (
                    <div className="text-center text-xs text-text-soft sm:text-sm">
                      <Link
                        href="/forgot-password"
                        className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200"
                      >
                        {loginCopy.form.forgot}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-center text-[11px] text-text-mute sm:text-xs">
                      By creating an account you agree to our{' '}
                      <Link
                        href="/terms"
                        className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200"
                      >
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-text-mute backdrop-blur-md">
                  {loginCopy.alerts.protectedNote}{' '}
                  <Link href="/contact" className="font-semibold text-brand-a hover:text-brand-b transition-colors duration-200">
                    {loginCopy.alerts.contactTeam}
                  </Link>
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
