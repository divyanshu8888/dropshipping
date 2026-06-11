import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function PayoutsPage() {
  return (
    <>
      <Head>
        <title>Payouts - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Learn how Unitiv payouts work for freelancers: instant release on milestone approval with Stripe Instant, bank transfer, and PayPal options worldwide."
        />
        <meta property="og:title" content="Payouts - Unitiv" />
        <meta
          property="og:description"
          content="Instant payout release on milestone approval with Stripe Instant, bank transfer, and PayPal options."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Payouts</h1>
          <p className="text-xl text-gray-300 mb-12">Get paid fast and securely</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">How Payouts Work</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Complete Milestone</h3>
                    <p className="text-gray-300 text-sm">Deliver work and get approved</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Automatic Processing</h3>
                    <p className="text-gray-300 text-sm">Payment released instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Receive Payment</h3>
                    <p className="text-gray-300 text-sm">Funds in your account</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Payment Methods</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <h3 className="font-semibold text-white">Bank Transfer</h3>
                    <p className="text-gray-300 text-sm">2-5 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="font-semibold text-white">Stripe Instant</h3>
                    <p className="text-gray-300 text-sm">Same day processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌍</span>
                  <div>
                    <h3 className="font-semibold text-white">PayPal</h3>
                    <p className="text-gray-300 text-sm">Available worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Security & Protection</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>All payouts processed through secure payment processors</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>PCI compliant payment handling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Full transaction history and receipts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>24/7 support for payment issues</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Payout Schedule</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Payments are processed immediately upon milestone approval. Processing times vary by payment method:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Stripe Instant</span>
                <span className="text-cyan-400">Same day</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Bank Transfer</span>
                <span className="text-gray-400">2-5 business days</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">PayPal</span>
                <span className="text-gray-400">1-2 business days</span>
              </div>
            </div>
          </div>

          {/* Why: internal links to apply, protection, and community */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <Link href="/apply" className="inline-flex items-center min-h-[44px] px-8 py-4 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Become a Freelancer
            </Link>
            <Link href="/protection" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Milestone Protection
            </Link>
            <Link href="/community" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              Freelancer Community
            </Link>
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

