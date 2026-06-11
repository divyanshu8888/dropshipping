import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';
import { useState } from 'react';

type FieldErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  // Why: inline per-field validation + explicit submit lifecycle for clear user feedback
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const validateField = (field: keyof FieldErrors, value: string): string | undefined => {
    switch (field) {
      case 'name':
        return value.trim().length < 2 ? 'Please enter your name.' : undefined;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : 'Please enter a valid email address.';
      case 'subject':
        return value.trim().length < 3 ? 'Please add a short subject.' : undefined;
      case 'message':
        return value.trim().length < 10 ? 'Please write at least 10 characters.' : undefined;
      default:
        return undefined;
    }
  };

  const validateAll = (): FieldErrors => {
    const next: FieldErrors = {};
    (Object.keys(formData) as Array<keyof FieldErrors>).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) next[field] = err;
    });
    return next;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const handleChange = (field: keyof FieldErrors, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Why: clear an error as soon as the user fixes the field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateAll();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setStatus('loading');
    try {
      // Why: no contact API exists yet — open the user's email app instead of faking a server send
      const mailto = `mailto:support@uniti.com?subject=${encodeURIComponent(
        formData.subject
      )}&body=${encodeURIComponent(`From: ${formData.name} <${formData.email}>\n\n${formData.message}`)}`;
      window.location.href = mailto;
      setStatus('success');
      setTimeout(() => setStatus('idle'), 10000);
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-3 min-h-[44px] bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
      errors[field] ? 'border-rose-400/60' : 'border-white/20'
    }`;

  return (
    <>
      <Head>
        <title>Contact Us - Unitiv</title>
        <meta
          name="description"
          content="Contact the Unitiv team for support, partnerships, or press enquiries. Send us a message and we will get back to you within one business day."
        />
        <meta property="og:title" content="Contact Us - Unitiv" />
        <meta
          property="og:description"
          content="Reach the Unitiv team for support, partnerships, or press enquiries. We respond within one business day."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-[#0B0C0F]">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden border-b border-white/10 bg-[#0B0C0F] pt-28 pb-16 min-h-[40vh]">
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-b from-violet-500/15 via-cyan-500/10 to-transparent blur-3xl" />
            <div className="relative max-w-4xl mx-auto px-6 text-center">
              <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/60 mb-5">
                Contact Us
              </span>
              <h1 className="text-[clamp(36px,5.5vw,68px)] font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
                We&apos;d love to{' '}
                <span className="hero-gradient-refined">hear from you</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                Got a question or want to work together? Drop us a message and we&apos;ll get back to you quickly.
              </p>
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Press &amp; Media</h3>
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

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-white mb-2">
                      Name <span className="text-rose-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={inputClass('name')}
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="mt-1.5 text-xs text-rose-300" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-white mb-2">
                      Email <span className="text-rose-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={254}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={inputClass('email')}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="mt-1.5 text-xs text-rose-300" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-white mb-2">
                      Subject <span className="text-rose-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      maxLength={150}
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onBlur={() => handleBlur('subject')}
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                      className={inputClass('subject')}
                      placeholder="What&apos;s this about?"
                    />
                    {errors.subject && (
                      <p id="contact-subject-error" className="mt-1.5 text-xs text-rose-300" role="alert">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-white mb-2">
                      Message <span className="text-rose-400" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      maxLength={5000}
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={`${inputClass('message')} resize-none`}
                      placeholder="Tell us more..."
                    />
                    {errors.message && (
                      <p id="contact-message-error" className="mt-1.5 text-xs text-rose-300" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {status === 'success' && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300" role="status">
                      ✓ Your email app should have opened with your message ready to send. If it didn&apos;t, email us
                      directly at support@uniti.com.
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-4 text-rose-300" role="alert">
                      We couldn&apos;t open your email app. Please email support@uniti.com directly.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-6 py-3 min-h-[44px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    {status === 'loading' ? 'Opening your email app…' : 'Send via Email'}
                  </button>
                </form>
              </div>
            </div>

            {/* Why: internal links so visitors can self-serve before reaching out */}
            <div className="mt-16 border-t border-white/10 pt-12 text-center">
              <h2 className="text-3xl font-semibold text-white">Prefer to explore first?</h2>
              <p className="mt-3 text-sm text-white/70 max-w-md mx-auto">
                Learn how Unitiv works, browse verified freelancers, or read about our mission.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 text-sm font-semibold text-white hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  How Unitiv Works
                </Link>
                <Link
                  href="/freelancers"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  Browse Freelancers
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  About Us
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
