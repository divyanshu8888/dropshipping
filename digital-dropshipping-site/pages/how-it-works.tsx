import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';

const clientSteps = [
  {
    n: '1',
    title: 'Create an account',
    desc: 'Sign up as a client in under 2 minutes. No credit card needed to get started.',
  },
  {
    n: '2',
    title: 'Post your project',
    desc: 'Describe what you need — skills, budget, and deadline. Our guided brief makes it easy.',
  },
  {
    n: '3',
    title: 'Get matched',
    desc: 'We surface verified freelancers based on your requirements. Review profiles, ratings, and past work.',
  },
  {
    n: '4',
    title: 'Collaborate & pay safely',
    desc: 'Work through milestones. Funds sit in escrow and are released only when you approve the work.',
  },
];

const freelancerSteps = [
  {
    n: '1',
    title: 'Create an account',
    desc: 'Sign up as a freelancer. It only takes a few minutes to get your profile live.',
  },
  {
    n: '2',
    title: 'Build your profile',
    desc: 'Showcase your skills, portfolio, and hourly rate. A strong profile gets you matched faster.',
  },
  {
    n: '3',
    title: 'Get discovered',
    desc: 'Clients browse verified freelancers. We also proactively match you to relevant projects.',
  },
  {
    n: '4',
    title: 'Deliver & earn',
    desc: 'Complete milestones, get approved, and receive payment securely — no chasing invoices.',
  },
];

const trustPoints = [
  { icon: '✓', title: 'Verified identities', desc: 'ID & portfolio checks on every freelancer' },
  { icon: '🔒', title: 'Escrow protection', desc: 'Funds released only when you approve' },
  { icon: '⚡', title: 'Fast matching', desc: 'Most projects matched within 24h' },
  { icon: '💬', title: 'Built-in comms', desc: 'Messaging, video calls & file sharing' },
];

export default function HowItWorksPage() {
  const [tab, setTab] = useState<'client' | 'freelancer'>('client');
  const { user } = useAuth();
  const router = useRouter();

  const handleClientCTA = () => {
    if (!user) return router.push('/login?mode=signup&role=client&redirect=/projects');
    if (user.role === 'FREELANCER') return router.push('/freelancers/dashboard');
    router.push('/projects');
  };

  const handleFreelancerCTA = () => {
    if (!user) return router.push('/login?mode=signup&role=freelancer&redirect=/freelancers/profile-setup');
    if (user.role !== 'FREELANCER') return router.push('/apply');
    router.push('/freelancers/profile-setup');
  };

  const steps = tab === 'client' ? clientSteps : freelancerSteps;

  return (
    <>
      <Head>
        <title>How It Works - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="See how Unitiv works for clients and freelancers: post a project, get matched with verified talent, collaborate through milestones, and pay safely via escrow."
        />
        <meta property="og:title" content="How It Works - Unitiv" />
        <meta
          property="og:description"
          content="Post a project, get matched with verified freelancers, collaborate through milestones, and pay safely via escrow."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        <main>
        {/* Hero */}
        <section className="relative pt-24 pb-14 text-center overflow-hidden min-h-[40vh]">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-b from-cyan-500/10 via-violet-500/8 to-transparent blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/60 mb-4">
              How It Works
            </span>
            <h1 className="text-[clamp(36px,5.5vw,68px)] font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              Simple.{' '}
              <span className="hero-gradient-refined">Secure.</span>{' '}
              Professional.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
              Whether you&apos;re hiring talent or offering your skills, Unitiv makes it straightforward.
            </p>

            {/* Tab toggle */}
            <div className="mt-8 inline-flex rounded-full border border-white/12 bg-white/[0.05] p-1">
              <button
                onClick={() => setTab('client')}
                className={`rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  tab === 'client' ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg' : 'text-white/55 hover:text-white/80'
                } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70`}
              >
                I&apos;m a Client
              </button>
              <button
                onClick={() => setTab('freelancer')}
                className={`rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  tab === 'freelancer' ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg' : 'text-white/55 hover:text-white/80'
                } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70`}
              >
                I&apos;m a Freelancer
              </button>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
          <div className="space-y-5">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex items-start gap-4 sm:gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-extrabold text-white shadow-lg shadow-cyan-950/30">
                  {step.n}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{step.title}</h2>
                  <p className="mt-1 text-sm text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA for current tab */}
          <div className="mt-10 text-center">
            {tab === 'client' ? (
              <div className="space-y-3">
                <button
                  onClick={handleClientCTA}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Post a Project →
                </button>
                <p className="text-xs text-white/40">
                  {user ? 'Go to your project dashboard' : 'Free to post · No obligation · Matched within 24h'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleFreelancerCTA}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  {user?.role === 'FREELANCER' ? 'Update my profile →' : 'Apply as a Freelancer →'}
                </button>
                <p className="text-xs text-white/40">
                  {user ? 'Keep your profile up to date to get more matches' : 'Free to join · No monthly fee · Earn on every project'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Trust points */}
        <section className="border-t border-white/10 bg-[#0B0D10] py-14">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-10 text-center text-xl font-bold text-white">
              Why{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Unitiv?</span>
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              {trustPoints.map((p) => (
                <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <div className="mb-2 text-3xl">{p.icon}</div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-xs text-white/55">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / Free section */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-4">
              Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Always{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">free</span>{' '}
              to use
            </h2>
            <p className="mt-3 text-sm text-white/55 max-w-md mx-auto">
              No subscriptions. No monthly fees. Only pay when work gets done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* For Clients */}
            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent p-7 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-[11px] font-semibold text-cyan-300 uppercase tracking-wider mb-4">
                For Clients
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">Free</div>
              <p className="text-xs text-white/50 mb-6">No credit card needed</p>
              <ul className="space-y-2.5">
                {['Post unlimited projects', 'Browse all verified freelancers', 'Milestone-based payment protection', 'Messaging, video calls & file sharing', 'Analytics dashboard', 'Team workspace', 'Custom contracts & NDAs'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Freelancers */}
            <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-500/10 via-purple-500/5 to-transparent p-7 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-400/10 border border-violet-400/20 px-3 py-1 text-[11px] font-semibold text-violet-300 uppercase tracking-wider mb-4">
                For Freelancers
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">Free</div>
              <p className="text-xs text-white/50 mb-6">No monthly subscription</p>
              <ul className="space-y-2.5">
                {['Create a free profile', 'Apply to unlimited projects', 'Get paid via milestone escrow', 'Messaging, video calls & file sharing', 'Portfolio showcase', 'Verified badge & trust score', 'Instant payout options'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-white/40">
            A small service commission is charged on successfully completed projects to cover escrow and payment protection.
          </p>
        </section>

        {/* Bottom CTA banner */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-6 sm:p-8 md:p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(0,198,255,0.08),transparent)]" />
            <p className="relative text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Need help choosing?</p>
            <h2 className="relative text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Didn&apos;t find the perfect match?{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">We&apos;ll shortlist great freelancers for you.</span>
            </h2>
            <p className="relative mt-2 text-sm text-white/55">
              Tell us what you need, and our team will send you a few vetted options.
            </p>
            <div className="relative mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
                {['✨ We do the matching', '✓ Identity verified', '🔒 Escrow-ready'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-white/70">{tag}</span>
                ))}
              </div>
              {/* Why: focus rings + internal links to open projects and freelancers */}
              <button
                onClick={handleClientCTA}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Post a Project →
              </button>
              <Link
                href="/open-projects"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Browse Open Projects
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                💬 Talk to a talent advisor
              </Link>
            </div>
            <p className="relative mt-4 text-[10px] uppercase tracking-widest text-white/30">
              Free to post · No obligation · Most projects matched within 24h
            </p>
          </div>
        </section>
        </main>
      </div>
    </>
  );
}
