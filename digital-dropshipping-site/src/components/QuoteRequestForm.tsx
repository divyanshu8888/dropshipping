import React, { useState } from 'react';

interface QuoteRequestFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectTitle: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    category: '',
    customCategory: '',
    notes: ''
  });

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

    // Validate email
    if (!validateEmail(formData.clientEmail)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    if (!formData.clientName || !formData.clientEmail || !formData.projectTitle || !formData.projectDescription) {
      setError('Please fill in all required fields');
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
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: finalCategory,
          budget: formData.budget ? parseFloat(formData.budget) : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit quote request');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-surface rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Request a Quote</h2>
            <p className="text-text-soft mt-1">Tell us about your project and we'll match you with the perfect freelancer</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-mute hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Client Information */}
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-base mb-2">Full Name *</label>
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
                <label className="block text-sm font-medium text-text-base mb-2">Email Address *</label>
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
              <label className="block text-sm font-medium text-text-base mb-2">Phone Number</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Project Details</h3>
            <div>
              <label className="block text-sm font-medium text-text-base mb-2">Project Title *</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="e.g., E-commerce Website Redesign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-base mb-2">Category *</label>
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
                  <label className="block text-sm font-medium text-text-base mb-2">Custom Category *</label>
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
              <label className="block text-sm font-medium text-text-base mb-2">Project Description *</label>
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
                <label className="block text-sm font-medium text-text-base mb-2">Budget (USD)</label>
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
                <label className="block text-sm font-medium text-text-base mb-2">Timeline</label>
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
              <label className="block text-sm font-medium text-text-base mb-2">Additional Notes</label>
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
          <div className="flex gap-4 pt-4">
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
