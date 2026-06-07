import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <>
      <Head>
        <title>Cookie Policy - Unitiv</title>
        <meta name="description" content="Cookie Policy for Unitiv platform" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Cookies are small text files stored on your device when you visit our website.
              They help us provide a better user experience by remembering your preferences and analyzing site usage.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Essential Cookies</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Required for basic site functionality including authentication, session management, and security.
              These cannot be disabled without affecting site functionality.
            </p>

            <h3 className="text-xl font-bold text-white mb-3">Analytics Cookies</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Help us understand how visitors interact with our platform, which pages are popular,
              and where improvements can be made. All data is anonymized.
            </p>

            <h3 className="text-xl font-bold text-white mb-3">Preference Cookies</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Remember your settings like language preferences, theme, and dashboard configurations
              to personalize your experience across sessions.
            </p>

            <h3 className="text-xl font-bold text-white mb-3">Marketing Cookies</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Used to track effectiveness of campaigns and provide relevant content.
              You can opt out of these cookies without affecting core functionality.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies.
              However, disabling essential cookies may impact your ability to use certain features of our platform.
              For detailed cookie management, access your browser's help documentation.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Some cookies are set by third-party services we use, including analytics providers,
              payment processors, and marketing tools. These services have their own privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We may update this Cookie Policy periodically. Significant changes will be communicated through
              platform notifications or email.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              For questions about our use of cookies, contact privacy@uniti.com.
            </p>
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

