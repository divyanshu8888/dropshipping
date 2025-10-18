import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';

export default function FreelancerProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    title: '',
    bio: '',
    description: '',
    country: '',
    skills: [] as string[],
    hourly_rate: 0,
    base_fee: 0,
    contact_phone: '',
    contact_email: '',
    portfolio_links: [] as string[],
    portfolio_images: [] as File[],
    services: [] as Array<{
      title: string;
      description: string;
      price: number;
      category: string;
      delivery_time: number;
    }>,
    // Verification fields
    id_document: null as File | null,
    id_type: '',
    id_number: '',
    address_proof: null as File | null,
    bank_account: '',
    tax_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const skillOptions = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Video Editing',
    'Photography', 'Branding', 'Consulting', 'Data Analysis', 'DevOps',
    'Backend Development', 'Frontend Development', 'Full Stack Development'
  ];

  const serviceCategories = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Video Editing',
    'Photography', 'Branding', 'Consulting', 'Other'
  ];

  useEffect(() => {
    // Check if user is logged in and is a freelancer
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'freelancer') {
      router.push('/client-dashboard');
      return;
    }

    // Pre-fill with user data
    setFormData(prev => ({
      ...prev,
      display_name: userData.name || '',
      contact_email: userData.email || ''
    }));
  }, [router]);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addPortfolioLink = () => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, '']
    }));
  };

  const updatePortfolioLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.map((link, i) => i === index ? value : link)
    }));
  };

  const removePortfolioLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        title: '',
        description: '',
        price: 0,
        category: '',
        delivery_time: 1
      }]
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic string/number fields
      if (formData.display_name) formDataToSend.append('display_name', formData.display_name);
      if (formData.title) formDataToSend.append('title', formData.title);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.country) formDataToSend.append('country', formData.country);
      if (formData.contact_phone) formDataToSend.append('contact_phone', formData.contact_phone);
      if (formData.contact_email) formDataToSend.append('contact_email', formData.contact_email);
      if (formData.hourly_rate) formDataToSend.append('hourly_rate', formData.hourly_rate.toString());
      if (formData.base_fee) formDataToSend.append('base_fee', formData.base_fee.toString());
      if (formData.id_type) formDataToSend.append('id_type', formData.id_type);
      if (formData.id_number) formDataToSend.append('id_number', formData.id_number);
      if (formData.bank_account) formDataToSend.append('bank_account', formData.bank_account);
      if (formData.tax_id) formDataToSend.append('tax_id', formData.tax_id);
      
      // Add arrays as JSON
      if (formData.skills.length > 0) {
        formDataToSend.append('skills', JSON.stringify(formData.skills));
      }
      if (formData.portfolio_links.length > 0) {
        formDataToSend.append('portfolio_links', JSON.stringify(formData.portfolio_links));
      }
      if (formData.services.length > 0) {
        formDataToSend.append('services', JSON.stringify(formData.services));
      }
      
      // Add file uploads
      if (formData.portfolio_images.length > 0) {
        formData.portfolio_images.forEach((file, index) => {
          formDataToSend.append(`portfolio_image_${index}`, file);
        });
      }
      if (formData.id_document) {
        formDataToSend.append('id_document', formData.id_document);
      }
      if (formData.address_proof) {
        formDataToSend.append('address_proof', formData.address_proof);
      }

      const response = await fetch('/api/freelancers/onboard', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/freelancer-dashboard');
      } else {
        setErrors({ submit: data.error || 'Error submitting profile. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Error submitting profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Complete Your Profile - TalentHub Pro</title>
        <meta name="description" content="Complete your freelancer profile to start getting clients" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />

        <div className="relative py-16 pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full border border-emerald-200">
                <span className="text-emerald-700 font-semibold text-sm">✨ Complete Your Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 mb-4">
                Complete Your Freelancer Profile
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
                Set up your profile to start attracting clients and getting projects
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                      placeholder="How you want to be known"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                      placeholder="e.g., Senior Web Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                      placeholder="Your country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Short Introduction) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                    placeholder="Tell clients about yourself in 1-2 sentences"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 transition-all duration-300 hover:bg-white focus:bg-white"
                    placeholder="Describe your experience, expertise, and what makes you unique"
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select your skills *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.skills.includes(skill)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Services & Pricing</h2>
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + Add Service
                  </button>
                </div>

                {formData.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Service {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Website Development"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Category</option>
                          {serviceCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (USD) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Time (days) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={service.delivery_time}
                          onChange={(e) => updateService(index, 'delivery_time', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="7"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Describe what this service includes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Identity Verification</h2>
                <p className="text-gray-600 mb-6">
                  For security and payment purposes, we need to verify your identity. This information is kept confidential and secure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Type *
                    </label>
                    <select
                      required
                      value={formData.id_type}
                      onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select ID Type</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your ID number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload ID Document *
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => setFormData({ ...formData, id_document: e.target.files?.[0] || null })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Upload a clear photo or scan of your ID</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Address Proof *
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => setFormData({ ...formData, address_proof: e.target.files?.[0] || null })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Utility bill, bank statement, etc.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="For payment processing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID / SSN
                    </label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="For tax purposes"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Project Fee (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.base_fee}
                      onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Portfolio Links
                  </label>
                  {formData.portfolio_links.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updatePortfolioLink(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://yourportfolio.com"
                      />
                      <button
                        type="button"
                        onClick={() => removePortfolioLink(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPortfolioLink}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    + Add Portfolio Link
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, portfolio_images: Array.from(e.target.files || []) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload images of your work (max 10 files)</p>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Profile...
                    </div>
                  ) : (
                    'Complete Profile & Submit for Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
