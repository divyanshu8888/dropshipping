'use client';

import { useState } from 'react';
import Link from 'next/link';

function FooterCol({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={heading}>
      <h4 className="text-white/95 text-xs font-semibold uppercase tracking-wider mb-1.5">{heading}</h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className="text-white/75 hover:text-white hover:underline underline-offset-4 text-[10px]"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<
    { type: ''; text: '' } | { type: 'success' | 'error'; text: string }
  >({ type: '', text: '' });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail);
    if (!ok) {
      setNewsletterMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterMsg({
          type: 'success',
          text: data.alreadySubscribed ? 'You are already subscribed!' : 'Thanks! You are subscribed.',
        });
        setNewsletterEmail('');
        setTimeout(() => setNewsletterMsg({ type: '', text: '' }), 5000);
      } else {
        setNewsletterMsg({ type: 'error', text: data.message || 'Failed to subscribe. Please try again.' });
        setTimeout(() => setNewsletterMsg({ type: '', text: '' }), 5000);
      }
    } catch {
      setNewsletterMsg({ type: 'error', text: 'Something went wrong. Please try again later.' });
      setTimeout(() => setNewsletterMsg({ type: '', text: '' }), 5000);
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#0B0D10]">
      {/* Soft brand wash */}
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(40%_60%_at_10%_0%,rgba(0,198,255,.06),transparent),radial-gradient(40%_60%_at_90%_100%,rgba(125,42,232,.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Top row: brand + newsletter */}
        <div className="grid gap-6 md:grid-cols-3 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <img
                src="/images/logo/logo2.1.png"
                alt="Unitiv Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-semibold text-white">Unitiv</span>
            </div>
            <p className="text-white/70 text-sm">
              Unity of ideas and experts. Build fast, build right.
            </p>
          </div>

          <div className="md:col-span-2">
            <form
              aria-label="Subscribe to product updates"
              className="flex w-full max-w-2xl flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur-md"
              onSubmit={handleNewsletterSubmit}
            >
              <label htmlFor="footer-newsletter" className="sr-only">Email address</label>
              <svg className="h-4 w-4 text-white/70" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="footer-newsletter"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Get product updates & tips"
                className="h-9 w-full rounded-xl bg-transparent px-2 text-white placeholder-white/60 outline-none text-xs focus-visible:ring-2 focus-visible:ring-sky-400/60"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1 rounded-xl px-4 font-medium text-white text-xs bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] hover:shadow-[0_0_18px_rgba(125,42,232,.45)] transition"
              >
                Subscribe
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
            <div role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs">
              {newsletterMsg.type === 'success' && <span className="text-emerald-400">{newsletterMsg.text}</span>}
              {newsletterMsg.type === 'error' && <span className="text-rose-400">{newsletterMsg.text}</span>}
            </div>
            <p className="mt-1 text-[10px] text-white/55">
              By subscribing you agree to our{' '}
              <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <FooterCol
            heading="Products"
            items={[
              { label: 'Browse Freelancers', href: '/freelancers' },
              { label: 'Request a Quote', href: '/request-quote' },
              { label: 'Verified Portfolios', href: '/verified' },
              { label: 'Categories', href: '/categories' },
            ]}
          />
          <FooterCol
            heading="For Clients"
            items={[
              { label: 'How it Works', href: '/how-it-works' },
              { label: 'Milestone Protection', href: '/protection' },
              { label: 'Pricing & Payments', href: '/pricing' },
              { label: 'Case Studies', href: '/case-studies' },
            ]}
          />
          <FooterCol
            heading="For Freelancers"
            items={[
              { label: 'Apply to Unitiv', href: '/apply' },
              { label: 'Verification Guide', href: '/verification' },
              { label: 'Payouts', href: '/payouts' },
              { label: 'Community', href: '/community' },
            ]}
          />
          <FooterCol
            heading="Company"
            items={[
              { label: 'About', href: '/about' },
              { label: 'Why Choose Us', href: '/why-choose-us' },
              { label: 'Blog', href: '/blog' },
              { label: 'Contact', href: '/contact' },
              { label: 'Careers', href: '/careers' },
            ]}
          />
        </div>

        {/* Legal bar */}
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} Unitiv. All rights reserved. ABN 00 000 000 000</p>
          <div className="flex items-center gap-5">
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/cookies" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <a
        href="#top"
        className="group fixed bottom-6 right-6 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/80 backdrop-blur-md hover:bg-white/10 hover:text-white transition z-50"
        aria-label="Back to top"
      >
        ↑
      </a>
    </footer>
  );
}
