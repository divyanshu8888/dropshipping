import Head from 'next/head';
import Link from 'next/link';
import Header from '../src/components/Header';

const nextSteps = [
  {
    n: '1',
    title: 'Order Confirmation',
    // Why: curly apostrophes in JS strings avoid react/no-unescaped-entities lint issues
    desc: 'You’ll receive an email confirmation shortly.',
  },
  {
    n: '2',
    title: 'Processing',
    desc: 'We’ll process your order within 1-2 business days.',
  },
  {
    n: '3',
    title: 'Delivery',
    desc: 'Your digital products will be delivered via email.',
  },
];

export default function ThankYouPage() {
  return (
    <>
      <Head>
        <title>Thank You - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Thank you for your Unitiv order. Your confirmation email is on the way — see what happens next, from processing within 1-2 business days to digital delivery."
        />
        <meta property="og:title" content="Thank You - Unitiv" />
        <meta
          property="og:description"
          content="Your Unitiv order has been received. See what happens next, from confirmation to digital delivery."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        {/* Why: transactional page should not be indexed */}
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden border-b border-white/10 bg-[#0B0C0F] pt-28 pb-16 min-h-[40vh]">
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-b from-cyan-500/15 via-violet-500/10 to-transparent blur-3xl" />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15">
                <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/60 mb-5">
                Order Received
              </span>
              <h1 className="text-[clamp(36px,5.5vw,68px)] font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
                Thank you — <span className="hero-gradient-refined">you&apos;re all set</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
                Your order has been received and is being processed.
              </p>
            </div>
          </section>

          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] p-8 mb-10">
              <h2 className="text-3xl font-semibold text-white mb-6">What happens next?</h2>
              <div className="space-y-6">
                {nextSteps.map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-extrabold text-white">
                      {step.n}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{step.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why: internal links + focus rings + 44px tap targets per design system */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Continue Shopping
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Need Help? Contact Us
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Back to Home
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
