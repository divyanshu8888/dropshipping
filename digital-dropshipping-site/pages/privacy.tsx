import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Uniti</title>
        <meta name="description" content="Privacy Policy for Uniti platform" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We collect information you provide during registration (name, email, professional details),
              profile information, project details, communications, and payment information. We also collect
              usage data and analytics to improve our platform.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Your information is used to facilitate connections between clients and freelancers,
              process payments, provide customer support, send important updates, and improve our services.
              We never sell your personal data to third parties.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We implement industry-standard security measures including encryption, secure payment processing,
              and regular security audits. Your data is stored securely with partners like Supabase and Stripe.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We share minimal information between matched clients and freelancers to facilitate projects.
              Payment information is handled through secure third-party processors. We may share aggregated,
              anonymized data for analytics purposes.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              You have the right to access, correct, or delete your personal information at any time through
              your account settings. You can opt out of marketing communications while maintaining essential service emails.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We use cookies to maintain sessions, improve user experience, and analyze platform usage.
              You can manage cookie preferences through your browser settings or our cookie preferences page.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We retain your data for as long as your account is active or as needed to provide services.
              Project data is retained for transaction records. Deleted accounts are removed within 30 days.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Uniti is not intended for users under 18. We do not knowingly collect information from minors.
              If we discover such information, we will delete it immediately.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">9. International Users</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Our platform serves users globally. By using Uniti, you consent to data processing in accordance
              with Australian privacy laws and international data protection standards.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              For privacy concerns or to exercise your rights, contact privacy@uniti.com or our support team.
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

