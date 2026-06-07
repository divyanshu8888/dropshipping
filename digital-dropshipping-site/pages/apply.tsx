import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '../src/components/Header'

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  useEffect(() => {
    // Only redirect if user is already a freelancer (has applied before)
    // Otherwise, show the form
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'freelancer') {
            router.replace('/freelancers/profile-setup');
            return;
          }
        } catch (e) {
          // Invalid user data, continue to show form
        }
      }
      setIsChecking(false);
    }
  }, [router]);

  const [formData, setFormData] = useState({
    display_name: '',
    title: '',
    bio: '',
    description: '',
    country: '',
    skills: [] as string[],
    hourly_rate: 0,
    base_fee: 0,
    contact_email: '',
    contact_phone: '',
    services: [] as Array<{
      title: string;
      description: string;
      price: number;
      category: string;
      delivery_time: number;
    }>
  })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
    'Netherlands', 'Australia', 'Singapore', 'India', 'Brazil', 'Mexico', 'UAE', 
    'South Korea', 'Japan', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Other'
  ]

  const commonSkills = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'PHP', 'Ruby', 'Java',
    'TypeScript', 'JavaScript', 'HTML/CSS', 'UI/UX Design', 'Graphic Design',
    'Mobile Development', 'iOS', 'Android', 'Flutter', 'React Native',
    'SEO', 'Digital Marketing', 'Content Writing', 'Copywriting',
    'Video Editing', 'Photography', 'Branding', 'Figma', 'Adobe Creative Suite'
  ]

  const serviceCategories = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Video Editing',
    'Photography', 'Branding', 'Consulting', 'Other'
  ]

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) })
  }

  const addService = () => {
    setFormData({ 
      ...formData, 
      services: [...formData.services, {
        title: '',
        description: '',
        price: 0,
        category: '',
        delivery_time: 1
      }]
    })
  }

  const removeService = (index: number) => {
    setFormData({ 
      ...formData, 
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setFormData({ ...formData, services: updatedServices })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await fetch('/api/freelancers/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert('🎉 Application submitted successfully! We\'ll review it within 48 hours.')
        router.push('/freelancers')
      } else {
        setErrors({ submit: data.error || 'Failed to submit application' })
      }
    } catch (error) {
      setErrors({ submit: 'Error submitting application. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking user
  if (isChecking) {
    return (
      <>
        <Head>
          <title>Apply as Freelancer - Unitiv</title>
          <meta name="description" content="Join Unitiv and connect with clients worldwide" />
        </Head>
        <div className="min-h-screen bg-[#0B0D10]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-white/70">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Apply as Freelancer - Unitiv</title>
        <meta name="description" content="Join Unitiv and connect with clients worldwide" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10]">
        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(99,102,241,0.35)_0%,rgba(15,15,20,1)_80%)] pt-32 pb-16">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-5">
              For Freelancers
            </span>
            <h1 className="text-[clamp(36px,6vw,72px)] font-extrabold tracking-[-0.03em] leading-[1.08] text-white mb-5">
              Join{' '}
              <span className="gradient-text">Unitiv</span>
            </h1>
            <p className="text-white/65 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Connect with thousands of clients and grow your freelance business on your own terms.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.08] pb-2 mb-4">Basic Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="Your professional name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Professional Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Short Bio * (50-200 characters)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                  placeholder="A brief tagline about yourself"
                />
                <p className="text-xs text-white/40 mt-1">{formData.bio.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full Description * (200+ characters)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                  placeholder="Tell us about your experience, expertise, and what makes you unique..."
                />
                <p className="text-xs text-white/40 mt-1">{formData.description.length}/200 characters minimum</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Country *</label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                >
                  <option value="" className="bg-[#0B0D10]">Select your country</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-[#0B0D10]">{country}</option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.08] pb-2 mb-4">Skills</p>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Skills *</label>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.5 text-xs text-cyan-300">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-cyan-400/60 hover:text-rose-400 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition flex-1"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 text-cyan-300 px-4 py-2 text-sm hover:from-cyan-500/30 transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => !formData.skills.includes(skill) && setFormData({ ...formData, skills: [...formData.skills, skill] })}
                      disabled={formData.skills.includes(skill)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        formData.skills.includes(skill)
                          ? 'border-white/5 bg-white/5 text-white/20 cursor-not-allowed'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-cyan-400/40 hover:text-cyan-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.08] pb-2 mb-4">Services</p>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Services You Offer</label>
                <p className="text-xs text-white/40 mb-4">Add the services you want to offer to clients</p>

                {formData.services.map((service, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-white/70">Service {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-xs text-rose-400/70 hover:text-rose-400 transition font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Service Title *</label>
                        <input
                          type="text"
                          required
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="e.g., Website Design"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Category *</label>
                        <select
                          required
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        >
                          <option value="" className="bg-[#0B0D10]">Select Category</option>
                          {serviceCategories.map((category) => (
                            <option key={category} value={category} className="bg-[#0B0D10]">{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Description *</label>
                      <textarea
                        required
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={3}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="Describe what this service includes..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Price (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
                          <input
                            type="number"
                            min="1"
                            required
                            value={service.price || ''}
                            onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                            className="bg-white/5 border border-white/10 rounded-xl text-white pl-7 pr-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                            placeholder="500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Delivery Time (Days) *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={service.delivery_time || ''}
                          onChange={(e) => updateService(index, 'delivery_time', parseInt(e.target.value) || 1)}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addService}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 transition"
                >
                  + Add Another Service
                </button>
              </div>

              {/* Pricing (Private) */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.08] pb-2 mb-4">Pricing Information</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private — Only visible to admins
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Hourly Rate (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-white/30 text-sm">$</span>
                        <input
                          type="number"
                          min="10"
                          required
                          value={formData.hourly_rate || ''}
                          onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
                          className="bg-white/5 border border-white/10 rounded-xl text-white pl-8 pr-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Minimum Project Fee (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-white/30 text-sm">$</span>
                        <input
                          type="number"
                          min="100"
                          required
                          value={formData.base_fee || ''}
                          onChange={(e) => setFormData({ ...formData, base_fee: parseInt(e.target.value) || 0 })}
                          className="bg-white/5 border border-white/10 rounded-xl text-white pl-8 pr-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-3">
                    🔒 These rates will be kept private and only shared with clients after approval
                  </p>
                </div>
              </div>

              {/* Contact Info (Private) */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.08] pb-2 mb-4">Contact Information</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Private — Never displayed publicly
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-3">
                    🔒 Your contact info will never be displayed publicly
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <p className="text-rose-400 text-xs">{errors.submit}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm text-white/70 hover:bg-white/10 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold py-3 transition hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
