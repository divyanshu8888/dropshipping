import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../src/components/Header';

interface SupplierFormData {
  company_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  tax_id: string;
  payment_terms: number;
  minimum_order_value: number;
  lead_time_days: number;
  shipping_regions: string[];
  certifications: string[];
  business_license: File | null;
  tax_certificate: File | null;
  insurance_certificate: File | null;
}

const SupplierOnboarding: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SupplierFormData>({
    company_name: '',
    business_type: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    tax_id: '',
    payment_terms: 30,
    minimum_order_value: 0,
    lead_time_days: 7,
    shipping_regions: [],
    certifications: [],
    business_license: null,
    tax_certificate: null,
    insurance_certificate: null
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'supplier' && user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
        if (!formData.business_type) newErrors.business_type = 'Business type is required';
        if (!formData.contact_email.trim()) newErrors.contact_email = 'Contact email is required';
        if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Contact phone is required';
        break;
      case 2:
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
        if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
        if (!formData.address.zip.trim()) newErrors['address.zip'] = 'ZIP code is required';
        if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required';
        break;
      case 3:
        if (!formData.tax_id.trim()) newErrors.tax_id = 'Tax ID is required';
        if (formData.minimum_order_value < 0) newErrors.minimum_order_value = 'Minimum order value must be positive';
        if (formData.lead_time_days < 1) newErrors.lead_time_days = 'Lead time must be at least 1 day';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append basic data
      submitData.append('company_name', formData.company_name);
      submitData.append('business_type', formData.business_type);
      submitData.append('contact_email', formData.contact_email);
      submitData.append('contact_phone', formData.contact_phone);
      submitData.append('website', formData.website);
      submitData.append('address', JSON.stringify(formData.address));
      submitData.append('tax_id', formData.tax_id);
      submitData.append('payment_terms', String(formData.payment_terms));
      submitData.append('minimum_order_value', String(formData.minimum_order_value));
      submitData.append('lead_time_days', String(formData.lead_time_days));
      submitData.append('shipping_regions', JSON.stringify(formData.shipping_regions));
      submitData.append('certifications', JSON.stringify(formData.certifications));

      // Append files if available
      if (formData.business_license) {
        submitData.append('business_license', formData.business_license);
      }
      if (formData.tax_certificate) {
        submitData.append('tax_certificate', formData.tax_certificate);
      }
      if (formData.insurance_certificate) {
        submitData.append('insurance_certificate', formData.insurance_certificate);
      }

      const response = await fetch('/api/suppliers/onboard', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        router.push('/supplier-dashboard');
      } else {
        setErrors({ submit: result.error || 'Failed to submit application' });
      }
    } catch (error) {
      console.error('Error submitting supplier application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Company Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.company_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your company name"
              />
              {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.business_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select business type</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
              </select>
              {errors.business_type && <p className="text-red-500 text-sm mt-1">{errors.business_type}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.contact_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@company.com"
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.contact_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://www.company.com"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Business Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street"
              />
              {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="New York"
                />
                {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="NY"
                />
                {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.address.zip}
                  onChange={(e) => handleInputChange('address.zip', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors['address.zip'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10001"
                />
                {errors['address.zip'] && <p className="text-red-500 text-sm mt-1">{errors['address.zip']}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors['address.country'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="United States"
              />
              {errors['address.country'] && <p className="text-red-500 text-sm mt-1">{errors['address.country']}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Business Details & Terms</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID *
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.tax_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="EIN or Tax ID"
              />
              {errors.tax_id && <p className="text-red-500 text-sm mt-1">{errors.tax_id}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms (Days)
                </label>
                <input
                  type="number"
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange('payment_terms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Value ($)
                </label>
                <input
                  type="number"
                  value={formData.minimum_order_value}
                  onChange={(e) => handleInputChange('minimum_order_value', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.minimum_order_value ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.minimum_order_value && <p className="text-red-500 text-sm mt-1">{errors.minimum_order_value}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Time (Days)
              </label>
              <input
                type="number"
                value={formData.lead_time_days}
                onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.lead_time_days ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
              />
              {errors.lead_time_days && <p className="text-red-500 text-sm mt-1">{errors.lead_time_days}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Regions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'].map(region => (
                  <label key={region} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.shipping_regions.includes(region)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('shipping_regions', [...formData.shipping_regions, region]);
                        } else {
                          handleInputChange('shipping_regions', formData.shipping_regions.filter(r => r !== region));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Document Upload</h3>
            <p className="text-gray-600">Please upload the required business documents for verification.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('business_license', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Certificate
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('tax_certificate', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Certificate
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('insurance_certificate', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>Supplier Onboarding - Join Our Network</title>
        <meta name="description" content="Join our supplier network and start dropshipping with us" />
      </Head>

      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierOnboarding;
