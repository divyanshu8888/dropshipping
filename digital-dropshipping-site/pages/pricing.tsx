import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing & Payments - Uniti</title>
        <meta name="description" content="Transparent pricing and secure payment options on Uniti" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Pricing & Payments</h1>
          <p className="text-xl text-gray-300 mb-12 text-center">Simple, transparent, secure</p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">How Our Pricing Works</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Uniti operates on a straightforward pricing model designed to be fair for everyone:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-cyan-400 pl-6 py-2">
                <h3 className="font-bold text-white mb-2">Free to Join</h3>
                <p className="text-gray-300 text-sm">No subscription fees, no hidden costs</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-6 py-2">
                <h3 className="font-bold text-white mb-2">Pay Only for Projects</h3>
                <p className="text-gray-300 text-sm">Simple platform fee applies to completed work</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-6 py-2">
                <h3 className="font-bold text-white mb-2">Transparent Fees</h3>
                <p className="text-gray-300 text-sm">Clear breakdown of all charges upfront</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">For Clients</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">Project Budget</h3>
                  <p className="text-gray-300 text-sm">Agree on a fair rate with your freelancer</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Platform Fee</h3>
                  <p className="text-gray-300 text-sm">Small service fee (shown upfront)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">Payment Protection</h3>
                  <p className="text-gray-300 text-sm">Escrow ensures you only pay for approved work</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">For Freelancers</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">Keep Most of Your Earnings</h3>
                  <p className="text-gray-300 text-sm">Fair commission structure</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Secure Payouts</h3>
                  <p className="text-gray-300 text-sm">Get paid promptly after approval</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">No Hidden Fees</h3>
                  <p className="text-gray-300 text-sm">Transparent fee structure</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Accepted Payment Methods</h2>
            <div className="flex flex-wrap gap-3">
              {['Visa', 'Mastercard', 'American Express', 'Stripe', 'Bank Transfer'].map(method => (
                <span key={method} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white">
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
              Browse Freelancers
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

