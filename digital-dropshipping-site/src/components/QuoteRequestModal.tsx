import React, { useState } from 'react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId?: string;
  freelancerName?: string;
  productName?: string;
}

export default function QuoteRequestModal({ 
  isOpen, 
  onClose, 
  freelancerId, 
  freelancerName,
  productName 
}: QuoteRequestModalProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_company: '',
    project_type: '',
    budget_range: '',
    timeline: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          freelancer_id: freelancerId || null
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          setFormData({
            client_name: '',
            client_email: '',
            client_company: '',
            project_type: '',
            budget_range: '',
            timeline: '',
            description: ''
          });
        }, 2000);
      } else {
        alert('Error submitting request. Please try again.');
      }
    } catch (error) {
      alert('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Get a Quote</h2>
              {freelancerName && (
                <p className="text-gray-600">Request quote from {freelancerName}</p>
              )}
              {productName && (
                <p className="text-gray-600">Quote for {productName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quote Request Sent!</h3>
              <p className="text-gray-600">We'll get back to you within 24 hours with a custom quote.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="client_name"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="client_email"
                    required
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client_company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="client_company"
                  value={formData.client_company}
                  onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              {/* Project Information */}
              <div>
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  id="project_type"
                  required
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select project type</option>
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range *
                  </label>
                  <select
                    id="budget_range"
                    required
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $1,000">Under $1,000</option>
                    <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                    <option value="Over $50,000">Over $50,000</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline *
                  </label>
                  <select
                    id="timeline"
                    required
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3+ months">3+ months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your project requirements, goals, and any specific details..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Quote Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
