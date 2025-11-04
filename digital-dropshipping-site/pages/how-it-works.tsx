import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <>
      <Head>
        <title>How It Works - Uniti</title>
        <meta name="description" content="Learn how Uniti connects clients with verified freelancers" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-xs text-white/60 font-bold tracking-wide uppercase mb-2">How It Works</h1>
            <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Simple. Secure.{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">Professional.</span>
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12">

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Post Your Project</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Create a detailed project brief with requirements, timeline, and budget.
                    Use our guided form to ensure nothing is missed. Request a custom quote from verified experts.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Get Matched</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Our platform matches you with verified professionals based on skills, portfolio, and ratings.
                    Review profiles, past work, and client testimonials before selecting your expert.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Collaborate Securely</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Work together through our platform with built-in messaging, file sharing, and milestone tracking.
                    Payments are held securely in escrow until you approve deliverables.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Approve & Pay</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Review completed work through our milestone system. Approve quality deliverables
                    to release payment. Your satisfaction is protected by our quality guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Choose Uniti?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">✓</div>
                <h3 className="font-semibold text-white mb-2">Verified Experts</h3>
                <p className="text-gray-300 text-sm">ID & portfolio checks</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-semibold text-white mb-2">Secure Payments</h3>
                <p className="text-gray-300 text-sm">Escrow protection</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-300 text-sm">Meeting deadlines</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
              Browse Freelancers
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

