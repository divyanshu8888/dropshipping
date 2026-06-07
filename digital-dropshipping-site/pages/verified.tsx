import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function VerifiedPage() {
  return (
    <>
      <Head>
        <title>Verified Portfolios - Unitiv</title>
        <meta name="description" content="Browse verified professional portfolios on Unitiv" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Verified Portfolios</h1>
          <p className="text-xl text-gray-300 mb-12">All professionals are verified before joining</p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">What Does Verified Mean?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Every freelancer on Unitiv undergoes a thorough verification process to ensure quality and trust:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Identity verification through government-issued ID</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Portfolio review to assess work quality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Skills assessment for claimed expertise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Background checks for professionalism</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Ongoing performance monitoring</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quality Assurance</h2>
            <p className="text-gray-300 leading-relaxed">
              We continuously monitor freelancer performance through client reviews, project completion rates,
              and quality metrics. Only the best professionals earn and maintain their verified status.
            </p>
          </div>

          <div className="text-center">
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
              Browse Verified Freelancers
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

