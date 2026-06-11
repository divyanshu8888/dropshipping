import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with Unitiv: A Complete Guide",
      excerpt: "Learn everything you need to know to start your first project with verified freelancers.",
      date: "2025-01-15",
      category: "Getting Started"
    },
    {
      id: 2,
      title: "How to Write a Winning Project Brief",
      excerpt: "Tips for creating clear, actionable project briefs that attract top talent.",
      date: "2025-01-10",
      category: "Tips & Tricks"
    },
    {
      id: 3,
      title: "Freelancer Spotlight: Success Stories",
      excerpt: "Read about how our verified experts have helped clients achieve their goals.",
      date: "2025-01-05",
      category: "Success Stories"
    }
  ];

  return (
    <>
      <Head>
        <title>Blog - Unitiv</title>
        {/* Why: full SEO/social meta with 150-160 char description */}
        <meta
          name="description"
          content="Read the Unitiv blog for hiring guides, freelancing tips, and success stories — from writing winning project briefs to growing your freelance business."
        />
        <meta property="og:title" content="Blog - Unitiv" />
        <meta
          property="og:description"
          content="Hiring guides, freelancing tips, and success stories from the Unitiv marketplace."
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
            <span className="block text-xs text-white/60 font-semibold tracking-[0.4em] uppercase mb-2">Blog</span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Insights, tips, and{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">stories</span>
            </h1>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 rounded-full text-xs text-cyan-300 font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <Link href="#" className="inline-flex items-center min-h-[44px] text-cyan-400 hover:text-cyan-300 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 rounded-lg">
                  Read more →
                </Link>
              </div>
            ))}
          </div>

          {/* Why: CTA section with internal links to deepen engagement */}
          <div className="mt-12 border-t border-white/10 pt-10 text-center">
            <h2 className="text-3xl font-semibold text-white">Ready to put these tips into action?</h2>
            <p className="mt-3 text-sm text-white/70 max-w-md mx-auto">Browse verified talent, see how the platform works, or read real client results.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/freelancers" className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-sm font-semibold text-white hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Browse Freelancers
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                How It Works
              </Link>
              <Link href="/case-studies" className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                Case Studies
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
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

