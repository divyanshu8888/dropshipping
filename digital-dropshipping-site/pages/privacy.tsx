import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import Link from 'next/link';

export default function PrivacyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Format date consistently on client side
    const date = new Date();
    const formatted = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setLastUpdated(formatted);
  }, []);

  return (
    <>
      <Head>
        <title>Privacy Policy - Uniti</title>
        <meta name="description" content="Privacy Policy for Uniti platform" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        {/* Hero Section */}
        <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0B0C0F] to-[#0B0C0F] pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/70 text-lg">
              {lastUpdated ? `Last updated: ${lastUpdated}` : 'Last updated: November 1, 2025'}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6 py-16">

          <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                1. Information We Collect
              </h2>
              <p className="text-white/80 leading-relaxed">
                We collect information you provide during registration (name, email, professional details),
                profile information, project details, communications, and payment information. We also collect
                usage data and analytics to improve our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                2. How We Use Your Information
              </h2>
              <p className="text-white/80 leading-relaxed">
                Your information is used to facilitate connections between clients and freelancers,
                process payments, provide customer support, send important updates, and improve our services.
                We never sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                3. Data Security
              </h2>
              <p className="text-white/80 leading-relaxed">
                We implement industry-standard security measures including encryption, secure payment processing,
                and regular security audits. Your data is stored securely with partners like Supabase and Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                4. Information Sharing
              </h2>
              <p className="text-white/80 leading-relaxed">
                We share minimal information between matched clients and freelancers to facilitate projects.
                Payment information is handled through secure third-party processors. We may share aggregated,
                anonymized data for analytics purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                5. Your Rights
              </h2>
              <p className="text-white/80 leading-relaxed">
                You have the right to access, correct, or delete your personal information at any time through
                your account settings. You can opt out of marketing communications while maintaining essential service emails.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                6. Cookies & Tracking
              </h2>
              <p className="text-white/80 leading-relaxed">
                We use cookies to maintain sessions, improve user experience, and analyze platform usage.
                You can manage cookie preferences through your browser settings or our{' '}
                <Link href="/cookies" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  cookie preferences page
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                7. Data Retention
              </h2>
              <p className="text-white/80 leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services.
                Project data is retained for transaction records. Deleted accounts are removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                8. Children's Privacy
              </h2>
              <p className="text-white/80 leading-relaxed">
                Uniti is not intended for users under 18. We do not knowingly collect information from minors.
                If we discover such information, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                9. International Users
              </h2>
              <p className="text-white/80 leading-relaxed">
                Our platform serves users globally. By using Uniti, you consent to data processing in accordance
                with Australian privacy laws and international data protection standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]"></span>
                10. Contact
              </h2>
              <p className="text-white/80 leading-relaxed">
                For privacy concerns or to exercise your rights, contact{' '}
                <a href="mailto:privacy@uniti.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  privacy@uniti.com
                </a>{' '}
                or our support team.
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-10 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

