import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '../src/components/Header'

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in and redirect to new profile setup
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'freelancer') {
        router.push('/freelancer-profile-setup');
        return;
      }
    }
    // If not logged in as freelancer, redirect to signup
    router.push('/signup');
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

  return (
    <>
      <Head>
        <title>Apply as Freelancer - Uniti</title>
        <meta name="description" content="Join Uniti and connect with clients worldwide" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Join Uniti
            </h1>
            <p className="text-xl text-indigo-100">
              Connect with thousands of clients and grow your freelance business
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your professional name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio * (50-200 characters)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="A brief tagline about yourself"
                />
                <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Description * (200+ characters)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tell us about your experience, expertise, and what makes you unique..."
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/200 characters minimum</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Country *</label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Skills *</label>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
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
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
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
                      className={`px-3 py-1 text-sm rounded-full border transition-all ${
                        formData.skills.includes(skill)
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Services You Offer</label>
                <p className="text-sm text-gray-600 mb-4">Add the services you want to offer to clients</p>
                
                {formData.services.map((service, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">Service {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Title *</label>
                        <input
                          type="text"
                          required
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g., Website Design"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          required
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          {serviceCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        required
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Describe what this service includes..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="1"
                            required
                            value={service.price || ''}
                            onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (Days) *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={service.delivery_time || ''}
                          onChange={(e) => updateService(index, 'delivery_time', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addService}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-medium"
                >
                  + Add Another Service
                </button>
              </div>

              {/* Pricing (Private) */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pricing Information (Private - Only visible to admins)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        min="10"
                        required
                        value={formData.hourly_rate || ''}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Project Fee (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        min="100"
                        required
                        value={formData.base_fee || ''}
                        onChange={(e) => setFormData({ ...formData, base_fee: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  🔒 These rates will be kept private and only shared with clients after approval
                </p>
              </div>

              {/* Contact Info (Private) */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information (Private)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  🔒 Your contact info will never be displayed publicly
                </p>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">{errors.submit}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg disabled:opacity-50"
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
