import React, { useState } from 'react';
import {
  COUNTRY_DIAL_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  findCountryOption,
  combinePhone,
  formatDialLabel,
} from '../lib/phone';

export type QuoteRequestContext = {
  source?: 'product' | 'freelancer' | 'general';
  intent?: 'proposal' | 'samples' | 'brief';
  title?: string;
  subtitle?: string;
  badge?: string;
  meta?: string;
  category?: string;
  freelancerId?: string | number;
  freelancerName?: string;
};

interface QuoteRequestFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  context?: QuoteRequestContext;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ onClose, onSuccess, context }) => {
  const requestSource = context?.source || 'general';
  const requestIntent = context?.intent || (context?.source === 'freelancer' ? 'proposal' : 'proposal');
  const suggestedTitle = context?.title;

  const defaultDial = findCountryOption(DEFAULT_COUNTRY_CODE);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectTitle: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    category: context?.category || '',
    customCategory: '',
    notes: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(defaultDial.dialCode);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Graphic Design',
    'Digital Marketing',
    'Content Writing',
    'SEO Services',
    'Data Analysis',
    'DevOps',
    'Quality Assurance',
    'Translation',
    'Consulting',
    'Other'
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validations aligned with API expectations
    const combinedPhone = combinePhone(phoneCountryCode, formData.clientPhone);
    const numericPhone = combinedPhone.replace(/[^\d]/g, '');

    // Validate email
    if (!validateEmail(formData.clientEmail)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Validate required fields and sensible minimums
    const issues: string[] = [];
    if (!formData.clientName || formData.clientName.trim().length < 3) {
      issues.push('Full Name must be at least 3 characters');
    }
    if (!formData.projectTitle || formData.projectTitle.trim().length < 6) {
      issues.push('Project Title must be at least 6 characters');
    }
    if (!formData.projectDescription || formData.projectDescription.trim().length < 30) {
      issues.push('Project Description must be at least 30 characters');
    }
    if (!formData.category) {
      issues.push('Please select a category');
    }
    if (!formData.timeline) {
      issues.push('Please select a timeline');
    }
    // Phone number optional, but if provided validate length
    if (formData.clientPhone && (numericPhone.length < 8 || numericPhone.length > 15)) {
      issues.push('Phone number looks invalid (use 8–15 digits including country code)');
    }

    if (issues.length > 0) {
      setError(`Validation failed: ${issues.join('; ')}`);
      setIsSubmitting(false);
      return;
    }

    // Use custom category if "Other" is selected and custom category is provided
    const finalCategory = formData.category === 'Other' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;

    if (!finalCategory) {
      setError('Please select a category or specify a custom one');
      setIsSubmitting(false);
      return;
    }

    try {
      const referrerPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const metaHeader = [
        `source=${requestSource}`,
        `intent=${requestIntent}`,
        context?.title ? `title=${context.title}` : '',
        context?.subtitle ? `subtitle=${context.subtitle}` : '',
        context?.badge ? `badge=${context.badge}` : '',
        context?.meta ? `meta=${context.meta}` : '',
        context?.freelancerId ? `freelancerId=${context.freelancerId}` : '',
        context?.freelancerName ? `freelancerName=${context.freelancerName}` : '',
        referrerPath ? `path=${referrerPath}` : ''
      ].filter(Boolean).join('; ');

      const combinedNotes = metaHeader.length > 0
        ? `[context] ${metaHeader}\n\n${formData.notes || ''}`.trim()
        : formData.notes;
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phoneCountryCode,
          clientPhone: combinedPhone,
          notes: combinedNotes,
          category: finalCategory,
          budget: formData.budget || null,
          requestSource,
          requestIntent,
          contextTitle: context?.title || null,
          contextSubtitle: context?.subtitle || null,
          contextBadge: context?.badge || null,
          contextMeta: context?.meta || null,
          contextFreelancerId: context?.freelancerId ?? null,
          contextFreelancerName: context?.freelancerName ?? null
        }),
      });

      if (!response.ok) {
        let serverMsg = 'Failed to submit quote request';
        try {
          const errorData = await response.json();
          const messages: string[] = [];
          if (typeof errorData?.message === 'string') messages.push(errorData.message);
          if (Array.isArray(errorData?.errors)) {
            messages.push(...errorData.errors.map((e: any) => (typeof e === 'string' ? e : JSON.stringify(e))));
          } else if (errorData?.errors && typeof errorData.errors === 'object') {
            messages.push(...Object.entries(errorData.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`));
          }
          if (Array.isArray(errorData?.details)) {
            messages.push(...errorData.details.map((d: any) => (typeof d === 'string' ? d : JSON.stringify(d))));
          }
          if (messages.length > 0) serverMsg = messages.join('; ');
        } catch {
          // ignore parse errors, keep default message
        }
        throw new Error(serverMsg);
      }

      const result = await response.json();
      console.log('Quote request submitted:', result);
      
      if (onSuccess) {
        onSuccess();
      } else {
        alert('Quote request submitted successfully! We\'ll get back to you within 24 hours.');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl my-6 rounded-[28px] border border-white/12 bg-[#0B0D12]/95 shadow-[0_30px_120px_-40px_rgba(37,99,235,0.45)] backdrop-blur-lg">
        <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-8">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-white/60">Uniti Request Desk</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Request a Quote</h2>
          <p className="mt-2 text-base text-white/75">
            Tell us about your project and we'll match you with a verified operator.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-text-mute hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"
          type="button"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

        {context && (
          <div className="mx-8 mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-1">Request context</p>
                <p className="text-lg font-semibold text-white">{context.title}</p>
                {context.subtitle && <p className="mt-1 text-white/70">{context.subtitle}</p>}
              </div>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 capitalize text-xs text-white/60">
                {requestIntent === 'samples' ? 'Sample request' : requestSource}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
              {context.badge && (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1">
                  {context.badge}
                </span>
              )}
              {context.meta && (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  {context.meta}
                </span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Client Information */}
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>

            {(context?.freelancerName || context?.freelancerId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {context.freelancerName && (
                  <div>
                    <label className="block text-sm font-medium text-white/85 mb-2">Operator Name</label>
                    <input
                      type="text"
                      value={String(context.freelancerName)}
                      readOnly
                      className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none cursor-not-allowed"
                    />
                  </div>
                )}
                {context.freelancerId && (
                  <div>
                    <label className="block text-sm font-medium text-white/85 mb-2">Operator ID</label>
                    <input
                      type="text"
                      value={String(context.freelancerId)}
                      readOnly
                      className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/85 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/85 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="john@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/85 mb-2">Phone Number</label>
              <div className="grid grid-cols-[64px_1fr] gap-1">
                <div className="relative">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-transparent focus:text-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    aria-label="Country dial code"
                  >
                    {COUNTRY_DIAL_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.dialCode} className="bg-bg-surface text-white">
                        {formatDialLabel(opt)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/90 text-base">
                    {phoneCountryCode}
                  </span>
                </div>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
              {/* Combined preview removed per request; only code shows in control */}
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Project Details</h3>
            <div>
              <label className="block text-sm font-medium text-white/85 mb-2">Project Title *</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder={suggestedTitle ? `Suggested: ${suggestedTitle}` : 'e.g., E-commerce Website Redesign'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/85 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-bg-surface">
                    {category}
                  </option>
                ))}
              </select>
              {formData.category === 'Other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-white/85 mb-2">Custom Category *</label>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Please specify your custom category"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/85 mb-2">Project Description *</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your project requirements, goals, and any specific features you need..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/85 mb-2">Budget (USD)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/85 mb-2">Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="">Select timeline</option>
                  <option value="asap" className="bg-bg-surface">ASAP</option>
                  <option value="1-week" className="bg-bg-surface">1 week</option>
                  <option value="2-weeks" className="bg-bg-surface">2 weeks</option>
                  <option value="1-month" className="bg-bg-surface">1 month</option>
                  <option value="2-months" className="bg-bg-surface">2 months</option>
                  <option value="3-months" className="bg-bg-surface">3+ months</option>
                  <option value="flexible" className="bg-bg-surface">Flexible</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/85 mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Any additional information, preferences, or requirements..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/10 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white font-semibold rounded-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteRequestForm;
