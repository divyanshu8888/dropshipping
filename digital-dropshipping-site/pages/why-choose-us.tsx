import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function WhyChooseUsPage() {
  const features = [
    {
      title: 'Verified Freelancers',
      description: 'All freelancers go through our rigorous verification process',
      icon: '✅',
    },
    {
      title: 'Secure Payments',
      description: 'Escrow protection ensures you only pay for completed work',
      icon: '🔒',
    },
    {
      title: 'Price Beat Guarantee',
      description: 'Found cheaper? We will beat that price by 5%',
      icon: '💰',
    },
    {
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee or your money back',
      icon: '💯',
    },
    {
      title: 'Fast Delivery',
      description: 'Get your projects delivered on time, every time',
      icon: '⚡'
    },
    {
      title: 'Global Network',
      description: 'Access to talent from around the world',
      icon: '🌍'
    }
  ];

  return (
    <>
      <Head>
        <title>Why Choose Us - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Discover why clients choose Unitiv: verified freelancers, secure escrow payments, quality guarantees, fast delivery, and a global network of trusted talent."
        />
        <meta property="og:title" content="Why Choose Us - Unitiv" />
        <meta
          property="og:description"
          content="Verified freelancers, secure escrow payments, quality guarantees, and a global talent network."
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
            <span className="block text-xs text-white/60 font-semibold tracking-[0.4em] uppercase mb-2">Why Choose Us</span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">succeed</span>
            </h1>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="relative p-4 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.08] transition-all duration-300">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-3">Ready to Get Started?</h2>
              <p className="text-sm text-white/70 mb-5 max-w-2xl mx-auto">
                Join thousands of clients and freelancers who trust Unitiv for their projects.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Why: ≥44px targets, focus rings, extra link to protection */}
                <Link
                  href="/freelancers"
                  className="inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] text-white rounded-full font-semibold hover:shadow-[0_0_18px_rgba(125,42,232,.45)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Browse Freelancers
                </Link>
                <Link
                  href="/protection"
                  className="inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm border border-white/15 text-white rounded-full font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Payment Protection
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm border border-white/15 text-white rounded-full font-semibold hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Apply as Freelancer
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home */}
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
