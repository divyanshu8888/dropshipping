import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - Uniti</title>
        <meta name="description" content="Learn about Uniti and our mission to connect verified freelancers with clients" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-xs text-white/60 font-bold tracking-wide uppercase mb-2">About Us</h1>
            <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Where ideas unite with{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">expert talent</span>
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12">

          <div className="prose prose-invert max-w-none">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                Uniti was born from a simple idea: <strong>Unity</strong> (bringing people together) + <strong>Idea</strong>
                {' '}(creative solutions) = Uniti. We connect verified professionals with clients worldwide, creating a secure,
                transparent marketplace for quality work delivery.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">What We Do</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We've built a platform that prioritizes:
              </p>
              <ul className="text-gray-300 space-y-2 list-disc pl-6">
                <li>Verified professionals who pass ID and portfolio checks</li>
                <li>Secure milestone-based payments with escrow protection</li>
                <li>Transparent project tracking and collaboration tools</li>
                <li>Global talent network across web, design, marketing, and more</li>
                <li>Fast, reliable delivery with quality guarantees</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">Trust First</h3>
                  <p className="text-gray-300">Every professional is verified. Every project is protected.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Quality Focus</h3>
                  <p className="text-gray-300">We maintain high standards for work delivery and service.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Transparency</h3>
                  <p className="text-gray-300">Clear communication, honest pricing, fair processes.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Innovation</h3>
                  <p className="text-gray-300">Constantly improving our platform and user experience.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Whether you're a client looking for expert help or a freelancer ready to grow your business,
                Uniti is here to support your journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/freelancers" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
                  Browse Freelancers
                </Link>
                <Link href="/apply" className="inline-flex items-center px-6 py-3 border border-white/25 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                  Apply as Freelancer
                </Link>
              </div>
            </div>
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

