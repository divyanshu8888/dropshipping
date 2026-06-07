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
        <meta name="description" content="Insights, tips, and stories from Unitiv" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-xs text-white/60 font-bold tracking-wide uppercase mb-2">Blog</h1>
            <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              Insights, tips, and{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">stories</span>
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12">

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
                <Link href="#" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                  Read more →
                </Link>
              </div>
            ))}
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

