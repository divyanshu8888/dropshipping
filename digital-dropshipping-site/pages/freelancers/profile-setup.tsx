import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../../src/components/Header'));

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

  const skillOptions = useMemo(() => [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Video Editing',
    'Photography', 'Branding', 'Consulting', 'Data Analysis', 'DevOps',
    'Backend Development', 'Frontend Development', 'Full Stack Development'
  ], []);

  const serviceCategories = useMemo(() => [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Video Editing',
    'Photography', 'Branding', 'Consulting', 'Other'
  ], []);

  useEffect(() => {
    // Check if user is logged in and is a freelancer
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'freelancer') {
      router.push('/clients/dashboard');
      return;
    }

    // Pre-fill with user data
    setFormData(prev => ({
      ...prev,
      display_name: userData.name || '',
      contact_email: userData.email || ''
    }));
  }, [router]);

  const handleSkillToggle = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  }, []);

  const addPortfolioLink = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, '']
    }));
  }, []);

  const updatePortfolioLink = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.map((link, i) => i === index ? value : link)
    }));
  }, []);

  const removePortfolioLink = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter((_, i) => i !== index)
    }));
  }, []);

  const addService = useCallback(() => {
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
  }, []);

  const updateService = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }));
  }, []);

  const removeService = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  }, []);

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
        router.push('/freelancers/dashboard');
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
        <title>Complete Your Profile - Uniti</title>
        <meta name="description" content="Complete your freelancer profile to start getting clients" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10] relative overflow-hidden">
        {/* Dark glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(6,182,212,0.12)_0%,rgba(15,15,20,1)_65%)] pt-28 pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-6 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04]">
              <span className="text-cyan-400 font-semibold text-sm">Complete Your Profile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 mb-4">
              Complete Your Freelancer Profile
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
              Set up your profile to start attracting clients and getting projects
            </p>
          </div>
        </section>

        <div className="relative py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-cyan-500/15 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-cyan-300 text-xl">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="How you want to be known"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="e.g., Senior Web Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="Your country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Bio (Short Introduction) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                    placeholder="Tell clients about yourself in 1-2 sentences"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                    placeholder="Describe your experience, expertise, and what makes you unique"
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Skills & Expertise</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-4">
                    Select your skills *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.skills.includes(skill)
                            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Services & Pricing</h2>
                  <button
                    type="button"
                    onClick={addService}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-5 py-2.5"
                  >
                    + Add Service
                  </button>
                </div>

                {formData.services.map((service, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Service {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                          Service Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="e.g., Website Development"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                          Category *
                        </label>
                        <select
                          required
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        >
                          <option value="" className="bg-[#0B0D10]">Select Category</option>
                          {serviceCategories.map((category) => (
                            <option key={category} value={category} className="bg-[#0B0D10]">{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                          Price (USD) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                          Delivery Time (days) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={service.delivery_time}
                          onChange={(e) => updateService(index, 'delivery_time', parseInt(e.target.value))}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="7"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                          Description *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="Describe what this service includes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification Section */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Identity Verification</h2>
                <p className="text-white/50 mb-6">
                  For security and payment purposes, we need to verify your identity. This information is kept confidential and secure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      ID Type *
                    </label>
                    <select
                      required
                      value={formData.id_type}
                      onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                    >
                      <option value="" className="bg-[#0B0D10]">Select ID Type</option>
                      <option value="passport" className="bg-[#0B0D10]">Passport</option>
                      <option value="drivers_license" className="bg-[#0B0D10]">Driver's License</option>
                      <option value="national_id" className="bg-[#0B0D10]">National ID</option>
                      <option value="other" className="bg-[#0B0D10]">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="Enter your ID number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Upload ID Document *
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] hover:border-cyan-400/30 transition p-8 text-center text-sm text-white/50">
                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setFormData({ ...formData, id_document: e.target.files?.[0] || null })}
                        className="w-full cursor-pointer"
                      />
                      <p className="mt-2">Upload a clear photo or scan of your ID</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Upload Address Proof *
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] hover:border-cyan-400/30 transition p-8 text-center text-sm text-white/50">
                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setFormData({ ...formData, address_proof: e.target.files?.[0] || null })}
                        className="w-full cursor-pointer"
                      />
                      <p className="mt-2">Utility bill, bank statement, etc.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="For payment processing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Tax ID / SSN
                    </label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="For tax purposes"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Pricing Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Hourly Rate (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Base Project Fee (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.base_fee}
                      onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Portfolio</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-4">
                    Portfolio Links
                  </label>
                  {formData.portfolio_links.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updatePortfolioLink(index, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition flex-1"
                        placeholder="https://yourportfolio.com"
                      />
                      <button
                        type="button"
                        onClick={() => removePortfolioLink(index)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPortfolioLink}
                    className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 hover:bg-white/10 transition"
                  >
                    + Add Portfolio Link
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Portfolio Images
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] hover:border-cyan-400/30 transition p-8 text-center text-sm text-white/50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, portfolio_images: Array.from(e.target.files || []) })}
                      className="w-full cursor-pointer"
                    />
                    <p className="mt-2">Upload images of your work (max 10 files)</p>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                  <p className="text-rose-300">{errors.submit}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
