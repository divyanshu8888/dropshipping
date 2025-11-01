import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function ProtectionPage() {
  return (
    <>
      <Head>
        <title>Milestone Protection - Uniti</title>
        <meta name="description" content="Learn how Uniti protects your payments through milestone-based escrow" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Milestone Protection</h1>
          <p className="text-xl text-gray-300 mb-12">Your payments are secure. Your project is protected.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
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

          <div className="mt-8 text-center">
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
              Start a Project
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

