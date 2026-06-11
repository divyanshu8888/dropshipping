import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function CareersPage() {
  const positions = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      type: "Full-time",
      location: "Remote"
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      type: "Full-time",
      location: "Hybrid"
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Support",
      type: "Full-time",
      location: "Remote"
    }
  ];

  return (
    <>
      <Head>
        <title>Careers - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Explore careers at Unitiv. Join a remote-first team building the future of freelance work, with open roles across engineering, design, and customer success."
        />
        <meta property="og:title" content="Careers - Unitiv" />
        <meta
          property="og:description"
          content="Join a remote-first team building the future of freelance work. Open roles in engineering, design, and support."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        <main>
        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Why: proper heading hierarchy — eyebrow is a span, the headline is the h1 */}
            <span className="block text-xs text-white/60 font-semibold tracking-[0.4em] uppercase mb-2">Careers</span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Join the{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">Unitiv team</span>
            </h1>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Work at Unitiv?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We&apos;re building the future of professional collaboration. Join us in creating a platform that
              empowers freelancers and helps clients bring their ideas to life with confidence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💼</span>
                <div>
                  <h3 className="font-semibold text-white">Flexible Work</h3>
                  <p className="text-gray-300 text-sm">Remote-first culture</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-semibold text-white">Global Impact</h3>
                  <p className="text-gray-300 text-sm">Connect talent worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-semibold text-white">Growth Opportunity</h3>
                  <p className="text-gray-300 text-sm">Learn and advance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❤️</span>
                <div>
                  <h3 className="font-semibold text-white">Great Team</h3>
                  <p className="text-gray-300 text-sm">Supportive environment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{position.title}</h3>
                      <p className="text-gray-400 text-sm">{position.department}</p>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs text-cyan-300">
                      {position.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>📍 {position.location}</span>
                  </div>
                  {/* Why: route applicants to contact since no ATS exists; ≥44px tap target + focus ring */}
                  <Link
                    href="/contact"
                    className="inline-flex items-center min-h-[44px] px-4 py-2 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Don&apos;t see a role that fits?</h2>
            <p className="text-gray-300 mb-4">We&apos;re always looking for talented people to join our team</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="inline-flex items-center min-h-[44px] px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Get in Touch
              </Link>
              <Link href="/about" className="inline-flex items-center min-h-[44px] px-6 py-3 border border-white/15 text-white rounded-lg font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                About Unitiv
              </Link>
              <Link href="/apply" className="inline-flex items-center min-h-[44px] px-6 py-3 border border-white/15 text-white rounded-lg font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Freelance with Us
              </Link>
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
        </section>
        </main>
      </div>
    </>
  );
}

