import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with Uniti: A Complete Guide",
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
        <title>Blog - Uniti</title>
        <meta name="description" content="Insights, tips, and stories from Uniti" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-gray-300 mb-12">Insights, tips, and stories</p>

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
            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

