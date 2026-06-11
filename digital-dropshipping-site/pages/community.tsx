import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <>
      <Head>
        <title>Community - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Join the Unitiv freelancer community to network with peers, access guides and best practices, and grow your freelance career alongside verified experts."
        />
        <meta property="og:title" content="Community - Unitiv" />
        <meta
          property="og:description"
          content="Network with peers, access guides, and grow your freelance career with the Unitiv community."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Freelancer Community</h1>
          <p className="text-xl text-gray-300 mb-12">Connect, learn, and grow together</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-3">Discussion Forums</h2>
              <p className="text-gray-300 mb-4">
                Share experiences, ask questions, and get advice from fellow freelancers
              </p>
              {/* Why: disabled state for a feature that does not exist yet */}
              <button disabled aria-disabled="true" className="min-h-[44px] px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/60 text-sm font-medium cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-white mb-3">Resources & Guides</h2>
              <p className="text-gray-300 mb-4">
                Access tutorials, best practices, and platform tips to maximize your success
              </p>
              <Link href="/verification" className="inline-flex items-center min-h-[44px] text-cyan-400 hover:text-cyan-300 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 rounded-lg">
                View Guides →
              </Link>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Community Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="font-semibold text-white mb-1">Networking</h3>
                <p className="text-gray-300 text-sm">Connect with peers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-white mb-1">Growth</h3>
                <p className="text-gray-300 text-sm">Learn and improve</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-white mb-1">Support</h3>
                <p className="text-gray-300 text-sm">Get help when needed</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Join?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Become part of our growing community of verified professionals.
            </p>
            {/* Why: internal links to apply, payouts, and how-it-works */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/apply" className="inline-flex items-center justify-center min-h-[44px] px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Apply as Freelancer
              </Link>
              <Link href="/payouts" className="inline-flex items-center justify-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Payouts &amp; Earnings
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                How It Works
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center min-h-[44px] px-4 text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 rounded-lg">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

