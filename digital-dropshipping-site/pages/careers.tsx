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
        <title>Careers - Uniti</title>
        <meta name="description" content="Join the Uniti team and help shape the future of freelance" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Careers</h1>
          <p className="text-xl text-gray-300 mb-12">Join the Uniti team</p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Work at Uniti?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We're building the future of professional collaboration. Join us in creating a platform that
              empowers freelancers and helps clients bring their ideas to life with confidence.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
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
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Don't see a role that fits?</h2>
            <p className="text-gray-300 mb-4">We're always looking for talented people to join our team</p>
            <Link href="/contact" className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition">
              Get in Touch
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

