import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with contact form API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <Head>
        <title>Contact Us - Unitiv</title>
        <meta name="description" content="Get in touch with Unitiv support team" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-xs text-white/60 font-bold tracking-wide uppercase mb-2">Contact Us</h1>
            <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              We'd love to{" "}
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">hear from you</span>
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12">

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">General Inquiries</h3>
                  <p className="text-gray-300">hello@uniti.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Support</h3>
                  <p className="text-gray-300">support@uniti.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Business Partnerships</h3>
                  <p className="text-gray-300">partners@uniti.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Press & Media</h3>
                  <p className="text-gray-300">press@uniti.com</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="text-lg font-semibold text-white mb-3">Office</h3>
                <p className="text-gray-300">Sydney, Australia</p>
                <p className="text-gray-300 mt-2">ABN: 00 000 000 000</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                {submitted && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">
                    ✓ Message sent! We'll get back to you soon.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Send Message
                </button>
              </form>
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
        </div>
      </div>
    </>
  );
}

