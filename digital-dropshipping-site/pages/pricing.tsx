import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';
import { useState } from 'react';

const CheckIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const plans = [
  {
    name: 'Starter',
    tagline: 'For individuals & first projects',
    monthly: 0,
    annual: 0,
    gradient: 'from-white/[0.04] to-white/[0.02]',
    border: 'border-white/10',
    badge: null,
    cta: 'Get started free',
    ctaHref: '/login?mode=signup',
    ctaClass: 'border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.1] hover:border-white/30',
    features: [
      { label: 'Post up to 5 projects', included: true },
      { label: 'Browse all freelancers', included: true },
      { label: 'Milestone-based payments', included: true },
      { label: 'Basic messaging & file sharing', included: true },
      { label: 'Platform fee: 8%', included: true },
      { label: 'Priority talent matching', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Team workspace', included: false },
      { label: 'Custom contracts & NDAs', included: false },
    ],
  },
  {
    name: 'Pro',
    tagline: 'For growing teams & frequent hirers',
    monthly: 29,
    annual: 22,
    gradient: 'from-cyan-500/10 via-blue-500/10 to-violet-500/10',
    border: 'border-cyan-400/30',
    badge: 'Most Popular',
    cta: 'Start 14-day free trial',
    ctaHref: '/login?mode=signup&plan=pro',
    ctaClass: 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-950/30 hover:shadow-violet-900/40 hover:opacity-95',
    features: [
      { label: 'Unlimited projects', included: true },
      { label: 'Browse all freelancers', included: true },
      { label: 'Milestone-based payments', included: true },
      { label: 'Messaging, video calls & file sharing', included: true },
      { label: 'Reduced platform fee: 4%', included: true },
      { label: 'Priority talent matching', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Team workspace (up to 5 seats)', included: true },
      { label: 'Custom contracts & NDAs', included: false },
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For agencies & high-volume teams',
    monthly: null,
    annual: null,
    gradient: 'from-violet-500/10 via-purple-500/10 to-indigo-500/10',
    border: 'border-violet-400/25',
    badge: null,
    cta: 'Contact sales',
    ctaHref: '/contact',
    ctaClass: 'border border-violet-400/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 hover:border-violet-400/60',
    features: [
      { label: 'Unlimited projects', included: true },
      { label: 'Browse all freelancers', included: true },
      { label: 'Milestone-based payments', included: true },
      { label: 'Messaging, video calls & file sharing', included: true },
      { label: 'Platform fee: negotiated (as low as 2%)', included: true },
      { label: 'Priority matching + dedicated SLA', included: true },
      { label: 'Advanced analytics & reporting', included: true },
      { label: 'Unlimited team workspace', included: true },
      { label: 'Custom contracts, NDAs & invoicing', included: true },
    ],
  },
];

const faqs = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — Pro comes with a 14-day free trial, no credit card required. Cancel any time before the trial ends and you won\'t be charged.',
  },
  {
    q: 'What is the platform fee?',
    a: 'The platform fee is a small percentage charged on each project and covers milestone escrow, payment protection, and dispute resolution. Starter: 8%, Pro: 4%, Enterprise: negotiated (as low as 2%).',
  },
  {
    q: 'How does milestone payment protection work?',
    a: 'Funds are held in escrow and only released to the freelancer once you approve each milestone. If a dispute arises, our team mediates and ensures fair resolution.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, anytime. Upgrades apply immediately; downgrades take effect at the end of your current billing cycle. You\'ll never be double-charged.',
  },
  {
    q: 'Do freelancers pay a fee?',
    a: 'Freelancers pay a commission on completed projects — 10% on Starter projects, 6% on Pro, and a negotiated rate on Enterprise. No monthly subscription for freelancers.',
  },
  {
    q: 'Is the annual plan worth it?',
    a: 'If you hire regularly, yes. The annual Pro plan at $22/mo saves you $84/year compared to monthly billing — that\'s over 2 months free.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>Pricing & Payments — Unitiv</title>
        <meta name="description" content="Simple, transparent pricing for clients and freelancers on Unitiv. Start free, upgrade as you grow." />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero */}
        <section className="relative pt-24 pb-16 text-center overflow-hidden">
          {/* Background glows */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-b from-cyan-500/10 via-violet-500/8 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-4">
              Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Simple,{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                transparent
              </span>{' '}
              pricing
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/65 max-w-xl mx-auto leading-relaxed">
              No hidden fees. Start free, scale when you're ready. Every plan includes milestone payment protection.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.05] p-1 backdrop-blur-sm">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  !annual ? 'bg-white/10 text-white shadow-sm' : 'text-white/55 hover:text-white/80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  annual ? 'bg-white/10 text-white shadow-sm' : 'text-white/55 hover:text-white/80'
                }`}
              >
                Annual
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border ${plan.border} bg-gradient-to-b ${plan.gradient} p-6 md:p-7 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)]`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-3 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-cyan-950/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-5">
                  <h2 className="text-base font-bold text-white">{plan.name}</h2>
                  <p className="mt-0.5 text-xs text-white/55">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthly === null ? (
                    <div>
                      <span className="text-3xl font-extrabold text-white">Custom</span>
                      <p className="mt-1 text-xs text-white/50">Tailored to your team</p>
                    </div>
                  ) : plan.monthly === 0 ? (
                    <div>
                      <span className="text-3xl font-extrabold text-white">Free</span>
                      <p className="mt-1 text-xs text-white/50">No credit card needed</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          ${annual ? plan.annual : plan.monthly}
                        </span>
                        <span className="mb-1 text-sm text-white/50">/mo</span>
                      </div>
                      {annual && (
                        <p className="mt-1 text-xs text-emerald-400">Billed annually — save ${((plan.monthly! - plan.annual!) * 12)}/yr</p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`mb-6 inline-flex h-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${plan.ctaClass}`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="mb-5 h-px bg-white/8" />

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                      <span className={`text-xs leading-relaxed ${f.included ? 'text-white/80' : 'text-white/35 line-through'}`}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Payment methods */}
        <section className="border-t border-white/10 bg-[#0B0D10] py-12">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Accepted payment methods</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Visa', 'Mastercard', 'American Express', 'PayPal', 'Stripe', 'Bank Transfer'].map((method) => (
                <span
                  key={method}
                  className="rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2 text-sm text-white/70"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
          <h2 className="mb-8 text-center text-xl font-bold text-white">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white/90 hover:text-white transition-colors"
                >
                  {faq.q}
                  <svg
                    className={`h-4 w-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-6 sm:p-8 md:p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(0,198,255,0.08),transparent)]" />
            <h2 className="relative text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Start building today
            </h2>
            <p className="relative mt-2 text-sm text-white/60">
              No commitment required. Get matched with a verified professional in minutes.
            </p>
            <div className="relative mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:shadow-violet-900/30"
              >
                Get started free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
