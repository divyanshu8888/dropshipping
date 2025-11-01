import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function VerificationPage() {
  return (
    <>
      <Head>
        <title>Verification Guide - Uniti</title>
        <meta name="description" content="Learn how to get verified as a freelancer on Uniti" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Verification Guide</h1>
          <p className="text-xl text-gray-300 mb-12">Get verified and start working with clients</p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Get Verified?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Verified freelancers get priority placement, better visibility, and increased client trust.
              The process is straightforward and typically takes 24-48 hours.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-white mb-1">More Clients</h3>
                <p className="text-gray-300 text-sm">Higher visibility</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✓</div>
                <h3 className="font-semibold text-white mb-1">Trust Badge</h3>
                <p className="text-gray-300 text-sm">Build credibility</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-1">Fast Approval</h3>
                <p className="text-gray-300 text-sm">Quick process</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Verification Requirements</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Identity Verification</h3>
                  <p className="text-gray-300 text-sm">Upload a government-issued ID (passport, driver's license, or national ID)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📁</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Portfolio Review</h3>
                  <p className="text-gray-300 text-sm">Share 3-5 examples of your best work with brief descriptions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">💼</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Professional Profile</h3>
                  <p className="text-gray-300 text-sm">Complete profile with skills, experience, and bio</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Payment Setup</h3>
                  <p className="text-gray-300 text-sm">Add payment information for secure payouts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Ready to become a verified freelancer? Apply now and join our community of top professionals.
            </p>
            <Link href="/apply" className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition">
              Apply for Verification
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

