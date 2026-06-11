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
        <title>Case Studies - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Explore Unitiv case studies: real client projects in web development, branding, and SEO with measurable results delivered by verified freelance experts."
        />
        <meta property="og:title" content="Case Studies - Unitiv" />
        <meta
          property="og:description"
          content="Real client projects in web development, branding, and SEO with measurable results from verified freelancers."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
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
            {/* Why: internal links to freelancers, how-it-works, and quote flow */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/freelancers" className="inline-flex items-center min-h-[44px] px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Browse Freelancers
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                How It Works
              </Link>
              <Link href="/why-choose-us" className="inline-flex items-center min-h-[44px] px-8 py-4 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Why Choose Us
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

