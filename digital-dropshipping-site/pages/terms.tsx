import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service - Unitiv</title>
        <meta name="description" content="Terms of Service for Unitiv platform" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Welcome to Unitiv. These Terms of Service govern your use of our platform connecting clients with verified freelancers.
              By using Unitiv, you agree to these terms.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Platform Services</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Unitiv provides a marketplace for connecting verified professionals with clients. We facilitate secure project collaboration,
              milestone tracking, and payment protection. All freelancers undergo verification before approval.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Users must provide accurate information, maintain account security, and conduct themselves professionally.
              Clients are responsible for clear project briefs and timely milestone approvals.
              Freelancers must deliver work as specified and maintain professional standards.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">4. Payment & Milestones</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Payments are held in escrow until milestones are approved. Refund policies apply based on project completion status and quality standards.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Upon full payment and project completion, intellectual property rights transfer to the client.
              Freelancers may use completed work in portfolios unless otherwise specified in the project agreement.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">6. Dispute Resolution</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Disputes are handled through our moderation team. Both parties must provide evidence.
              Unitiv's decision is final for platform-related issues. External disputes may require legal resolution.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Unitiv serves as a platform facilitator. We are not liable for work quality, delivery delays, or disputes
              between users beyond our moderation processes. Use the platform at your own discretion.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Accounts may be suspended or terminated for violations of these terms, fraudulent activity, or unprofessional conduct.
              Ongoing projects must be completed per agreement terms.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We reserve the right to modify these terms. Users will be notified of significant changes via email
              or platform notifications. Continued use constitutes acceptance of updated terms.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              For questions about these terms, contact us at legal@uniti.com or through our platform support system.
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

