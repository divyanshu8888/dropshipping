import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function ProtectionPage() {
  return (
    <>
      <Head>
        <title>Milestone Protection - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="See how Unitiv milestone protection keeps payments safe: funds sit in secure Stripe escrow, you review work before release, and disputes are fully supported."
        />
        <meta property="og:title" content="Milestone Protection - Unitiv" />
        <meta
          property="og:description"
          content="Funds sit in secure escrow, you review work before release, and disputes are fully supported."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        <main>
        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Why: proper heading hierarchy — eyebrow is a span, the headline is the h1 */}
            <span className="block text-xs text-white/60 font-semibold tracking-[0.4em] uppercase mb-2">Milestone Protection</span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Your payments are{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">secure</span>
            </h1>
            <p className="mt-3 text-white/60 text-sm">Last updated: June 2026</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-white mb-2">Secure Escrow</h3>
              <p className="text-gray-300 text-sm">Payments held safely until approval</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-bold text-white mb-2">Quality Assurance</h3>
              <p className="text-gray-300 text-sm">Review before release</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-lg font-bold text-white mb-2">Dispute Resolution</h3>
              <p className="text-gray-300 text-sm">Protected by our team</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Set Milestones</h3>
                  <p className="text-gray-300">Break your project into clear, manageable milestones with specific deliverables and deadlines.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Fund Securely</h3>
                  <p className="text-gray-300">Payments are held in secure escrow through Stripe. Funds only release when you approve.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Review Work</h3>
                  <p className="text-gray-300">Examine deliverables, request revisions if needed, and approve quality before payment.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Release Payment</h3>
                  <p className="text-gray-300">Once satisfied, approve the milestone to release payment instantly to the freelancer.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Additional Protection</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Auto-approval if no action taken within agreed timeframe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>24/7 dispute resolution support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Full payment history and transaction records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Refund processing for unsatisfactory work</span>
              </li>
            </ul>
          </div>

          {/* Why: focus rings + internal links to payouts and terms */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <Link href="/freelancers" className="inline-flex items-center min-h-[44px] px-8 py-4 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Start a Project
            </Link>
            <Link href="/payouts" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              How Payouts Work
            </Link>
            <Link href="/terms" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Terms of Service
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </section>
        </main>
      </div>
    </>
  );
}

