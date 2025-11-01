import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 1,
      project: "E-commerce Platform Redesign",
      client: "Tech Startup",
      freelancer: "Expert Developer",
      result: "100% increase in conversions",
      category: "Web Development"
    },
    {
      id: 2,
      project: "Brand Identity Package",
      client: "Local Business",
      freelancer: "Creative Designer",
      result: "Complete rebrand delivered",
      category: "Branding"
    },
    {
      id: 3,
      project: "SEO Optimization Campaign",
      client: "Online Store",
      freelancer: "SEO Specialist",
      result: "3x organic traffic growth",
      category: "Digital Marketing"
    }
  ];

  return (
    <>
      <Head>
        <title>Case Studies - Uniti</title>
        <meta name="description" content="Real success stories from Uniti clients and freelancers" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Case Studies</h1>
          <p className="text-xl text-gray-300 mb-12">Real results from real projects</p>

          <div className="space-y-8">
            {caseStudies.map((study) => (
              <div key={study.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 rounded-full text-xs text-cyan-300 font-medium">
                    {study.category}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Client</p>
                    <p className="text-white font-medium">{study.client}</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{study.project}</h2>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                  <span>Freelancer: <span className="text-white">{study.freelancer}</span></span>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-lg font-bold text-green-300">Result: {study.result}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Start Your Success Story?</h2>
            <p className="text-gray-300 mb-6">Connect with verified experts and bring your ideas to life</p>
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition">
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

