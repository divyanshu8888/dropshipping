import { useState, useMemo, useEffect, useRef } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../src/components/Header'
import QuoteRequestForm from '../../src/components/QuoteRequestForm'
import { query } from '../../src/lib/mysql'
import styles from '../../src/styles/freelancers.module.css'

interface Freelancer {
  id: string;
  display_name: string;
  headline: string | null;
  title: string;
  description: string;
  country: string | null;
  country_code?: string; // ISO code like 'AU', 'US'
  skills: string[];
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  completed_projects: number;
  response_time: string | null;
  availability: string;
  verification_state: string;
  experience_level?: 'intermediate' | 'senior' | 'expert';
  turnaround_days?: number;
  timezone_offset?: number;
  languages?: string[];
  industries?: string[];
  portfolio_thumbs?: string[];
  // Calculated fields
  overlap_hours?: string;
}

interface FreelancersPageProps {
  freelancers: Freelancer[];
}

// Helper to get country code from country name
function getCountryCode(country: string | null): string {
  if (!country) return '🌍';
  const countryMap: { [key: string]: string } = {
    'Australia': 'AU',
    'United States': 'US',
    'United Kingdom': 'UK',
    'Canada': 'CA',
    'Germany': 'DE',
    'India': 'IN',
  };
  return countryMap[country] || country.substring(0, 2).toUpperCase();
}

// Helper to calculate timezone overlap (simplified)
function calculateOverlapHours(timezoneOffset: number | undefined): string {
  if (!timezoneOffset) return '4–6h';
  // Simplified: assume most clients are in similar timezones
  const offsetHours = Math.abs(timezoneOffset / 60);
  if (offsetHours <= 2) return '6–8h';
  if (offsetHours <= 4) return '4–6h';
  if (offsetHours <= 6) return '2–4h';
  return '1–2h';
}

export default function FreelancersPage({ freelancers }: FreelancersPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('freelancer_recent_searches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch (e) {
          console.error('Error loading recent searches:', e)
        }
      }
    }
  }, [])
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }
    
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])
  
  // Get search suggestions based on input
  const getSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    
    const term = searchTerm.toLowerCase()
    const suggestions: string[] = []
    
    // Match skills
    freelancers.forEach(f => {
      f.skills.forEach(skill => {
        if (skill.toLowerCase().includes(term) && !suggestions.includes(skill)) {
          suggestions.push(skill)
        }
      })
    })
    
    // Match titles
    freelancers.forEach(f => {
      if (f.title.toLowerCase().includes(term) && !suggestions.includes(f.title)) {
        suggestions.push(f.title)
      }
    })
    
    // Match popular categories
    const popular = ['UI/UX Design', 'Web Development', 'Content Writing', 'Branding', 'SEO', 'Mobile Development', 'Backend Development']
    popular.forEach(cat => {
      if (cat.toLowerCase().includes(term) && !suggestions.includes(cat)) {
        suggestions.push(cat)
      }
    })
    
    return suggestions.slice(0, 8)
  }, [searchTerm, freelancers])
  
  // Filter states
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [experienceFilter, setExperienceFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [turnaroundFilter, setTurnaroundFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('rating')

  // Service categories for filtering
  const serviceCategories = [
    { value: 'all', label: 'All Services' },
    { value: 'web-development', label: 'Web Development', skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS', 'Vue.js', 'Next.js'] },
    { value: 'ui-ux-design', label: 'UI/UX Design', skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'] },
    { value: 'mobile-development', label: 'Mobile Development', skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android'] },
    { value: 'backend-development', label: 'Backend Development', skills: ['Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes'] },
    { value: 'content-writing', label: 'Content Writing', skills: ['Content Writing', 'SEO', 'Copywriting', 'Technical Writing', 'Blog Writing'] },
    { value: 'marketing', label: 'Marketing', skills: ['SEO', 'Social Media', 'Content Strategy', 'Email Marketing'] },
    { value: 'data-science', label: 'Data Science', skills: ['Python', 'Data Analysis', 'Machine Learning', 'SQL', 'R'] },
  ]

  // Get active filters for summary
  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; onRemove: () => void }> = []
    if (ratingFilter === '4.5+') {
      filters.push({ key: 'rate', label: 'Rating 4.5+', onRemove: () => setRatingFilter('all') })
    } else if (ratingFilter === '4.8+') {
      filters.push({ key: 'rate', label: 'Rating 4.8+', onRemove: () => setRatingFilter('all') })
    }
    if (experienceFilter === 'intermediate') {
      filters.push({ key: 'exp', label: 'Intermediate', onRemove: () => setExperienceFilter('all') })
    } else if (experienceFilter === 'senior') {
      filters.push({ key: 'exp', label: 'Senior', onRemove: () => setExperienceFilter('all') })
    } else if (experienceFilter === 'expert') {
      filters.push({ key: 'exp', label: 'Expert', onRemove: () => setExperienceFilter('all') })
    }
    if (availabilityFilter === 'available') {
      filters.push({ key: 'avail', label: 'Available Now', onRemove: () => setAvailabilityFilter('all') })
    } else if (availabilityFilter === 'within_1_week') {
      filters.push({ key: 'avail', label: 'Available in 1 Week', onRemove: () => setAvailabilityFilter('all') })
    } else if (availabilityFilter === 'within_2_weeks') {
      filters.push({ key: 'avail', label: 'Available in 2 Weeks', onRemove: () => setAvailabilityFilter('all') })
    }
    if (turnaroundFilter === '24h') {
      filters.push({ key: 'del', label: '24 Hours', onRemove: () => setTurnaroundFilter('all') })
    } else if (turnaroundFilter === '48h') {
      filters.push({ key: 'del', label: '48 Hours', onRemove: () => setTurnaroundFilter('all') })
    } else if (turnaroundFilter === '3-5d') {
      filters.push({ key: 'del', label: '3-5 Days', onRemove: () => setTurnaroundFilter('all') })
    } else if (turnaroundFilter === '1-2w') {
      filters.push({ key: 'del', label: '1-2 Weeks', onRemove: () => setTurnaroundFilter('all') })
    }
    if (serviceFilter !== 'all') {
      const service = serviceCategories.find(s => s.value === serviceFilter)
      if (service) {
        filters.push({ key: 'service', label: service.label, onRemove: () => setServiceFilter('all') })
      }
    }
    return filters
  }, [availabilityFilter, experienceFilter, ratingFilter, turnaroundFilter, serviceFilter, serviceCategories])

  const clearAllFilters = () => {
    setAvailabilityFilter('all')
    setExperienceFilter('all')
    setRatingFilter('all')
    setTurnaroundFilter('all')
    setServiceFilter('all')
  }

  // Handle search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (searchTerm.trim()) {
      // Save to recent searches
      if (typeof window !== 'undefined') {
        const updated = [searchTerm.trim(), ...recentSearches.filter(s => s !== searchTerm.trim())].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('freelancer_recent_searches', JSON.stringify(updated))
      }
      
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      // Search is handled by filteredFreelancers automatically
    }
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getSuggestions
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setShowSuggestions(true)
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        setSearchTerm(suggestions[selectedSuggestionIndex])
        handleSearchSubmit()
      } else {
        handleSearchSubmit()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }
  
  // Get unique values from database for filters
  const uniqueIndustries = useMemo(() => {
    const all = freelancers.flatMap(f => f.industries || []).filter(Boolean);
    return Array.from(new Set(all)).sort();
  }, [freelancers]);

  const uniqueLanguages = useMemo(() => {
    const all = freelancers.flatMap(f => f.languages || []).filter(Boolean);
    return Array.from(new Set(all)).sort();
  }, [freelancers]);

  // Filter freelancers
  const filteredFreelancers = useMemo(() => {
    let filtered = freelancers.filter(freelancer => {
      // Search filter
      const matchesSearch = !searchTerm || 
        freelancer.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      // Availability filter
      const matchesAvailability = availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && freelancer.availability === 'available') ||
        (availabilityFilter === 'within_1_week' && freelancer.availability === 'available') ||
        (availabilityFilter === 'within_2_weeks' && freelancer.availability !== 'unavailable')

      // Experience filter
      const matchesExperience = experienceFilter === 'all' ||
        freelancer.experience_level === experienceFilter

      // Rating filter
      const matchesRating = ratingFilter === 'all' ||
        (ratingFilter === '4.5+' && freelancer.rating >= 4.5) ||
        (ratingFilter === '4.8+' && freelancer.rating >= 4.8)

      // Turnaround filter
      const matchesTurnaround = turnaroundFilter === 'all' ||
        (turnaroundFilter === '24h' && freelancer.turnaround_days && freelancer.turnaround_days <= 1) ||
        (turnaroundFilter === '48h' && freelancer.turnaround_days && freelancer.turnaround_days <= 2) ||
        (turnaroundFilter === '3-5d' && freelancer.turnaround_days && freelancer.turnaround_days >= 3 && freelancer.turnaround_days <= 5) ||
        (turnaroundFilter === '1-2w' && freelancer.turnaround_days && freelancer.turnaround_days >= 7 && freelancer.turnaround_days <= 14)

      // Service filter - match skills to service category
      const matchesService = serviceFilter === 'all' || (() => {
        const service = serviceCategories.find(s => s.value === serviceFilter)
        if (!service || !service.skills) return true
        // Check if freelancer has any skills matching the service category
        return freelancer.skills.some(skill => 
          service.skills!.some(serviceSkill => 
            skill.toLowerCase().includes(serviceSkill.toLowerCase()) ||
            serviceSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      })()

      return matchesSearch && matchesAvailability && matchesExperience && 
             matchesRating && matchesTurnaround && matchesService
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'reviews':
          return b.total_reviews - a.total_reviews
        case 'projects':
          return b.completed_projects - a.completed_projects
        case 'experience':
          const levelOrder = { 'expert': 3, 'senior': 2, 'intermediate': 1 }
          return (levelOrder[b.experience_level || 'intermediate'] || 0) - 
                 (levelOrder[a.experience_level || 'intermediate'] || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [freelancers, searchTerm, availabilityFilter, experienceFilter, ratingFilter, turnaroundFilter, serviceFilter, sortBy, serviceCategories])

  return (
    <>
      <Head>
        <title>Find Freelancers - Uniti</title>
        <meta name="description" content="Browse verified freelancers and hire top talent for your projects" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10]">
        <Header />

        {/* Hero Section - Enhanced Professional Design */}
        <section className="relative overflow-hidden text-white py-20 md:py-28 pt-32">
          {/* Enhanced Diagonal Gradient Background - Using brand colors */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0B0C0F 0%, #101218 25%, rgba(96, 165, 250, 0.15) 50%, rgba(167, 139, 250, 0.15) 75%, #0B0C0F 100%)'
            }}
          />
          
          {/* Subtle Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            />
          </div>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          
          {/* Subtle Vignette Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2),transparent_70%)]" />
          
          {/* Additional Depth Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          
          {/* Blurred Glow Behind Search Area - Using brand colors */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-4xl h-32 bg-gradient-to-r from-brand-a/20 via-brand-b/20 to-brand-c/20 blur-3xl opacity-50" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 animate-fade-in-up">
              {/* Headline with Gradient Highlight - Matching Homepage */}
              <h1 className="mx-auto font-extrabold text-[clamp(32px,5.5vw,48px)] leading-[1.15] whitespace-nowrap animate-fade-in-up animate-delay-100 tracking-tight">
                Find the{' '}
                <span className={styles.heroGradient}>
                  Perfect Freelancer
                </span>
              </h1>
              
              {/* Enhanced Subtext - Matching Homepage */}
              <p className="mx-auto text-[clamp(14px,1.5vw,16px)] max-w-[600px] animate-fade-in-up animate-delay-300 hero-tagline">
                Discover top-rated professionals ready to design, build, and scale your vision
              </p>
              
              {/* Trust Bar - Freelancer-Specific */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Portfolios</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Fast Response Times</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Top-Rated Professionals</span>
                </div>
              </div>
              
              {/* Enhanced Search Bar - Matching Homepage Style */}
              <div className="flex items-center justify-center animate-fade-in-up animate-delay-500" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-[680px] items-center gap-3 rounded-full px-4 h-[50px] bg-white border border-gray-200 shadow-lg transition-all duration-300 focus-within:border-blue-400 focus-within:shadow-xl">
                  <svg className="h-5 w-5 text-gray-600 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowSuggestions(true)
                      setSelectedSuggestionIndex(-1)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    aria-label="Search freelancers"
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    className="h-full flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-500"
                    placeholder="Try 'Web Designer', 'Logo Animation', or 'SEO Audit'..."
                  />
                  <button
                    type="submit"
                    className="shrink-0 h-[38px] px-4 rounded-full text-white font-medium transition-all text-sm bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 focus:outline-none"
                    style={{
                      boxShadow: '0 4px 16px rgba(125,42,232,0.25)'
                    }}
                    >
                    Search
                  </button>
                  
                  {/* Inline Suggestions Dropdown */}
                  {(showSuggestions && (getSuggestions.length > 0 || recentSearches.length > 0)) && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-gray-200 shadow-2xl max-h-80 overflow-y-auto z-50"
                      style={{
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                      }}
                      role="listbox"
                    >
                      {/* Suggestions */}
                      {getSuggestions.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Suggestions</div>
                          {getSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setSearchTerm(suggestion)
                                handleSearchSubmit()
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ${
                                selectedSuggestionIndex === index
                                  ? 'bg-gradient-to-r from-brand-a/10 to-brand-b/10 text-gray-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              role="option"
                              aria-selected={selectedSuggestionIndex === index}
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>{suggestion}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && searchTerm.length === 0 && (
                        <div className="p-2 border-t border-gray-100">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Searches</div>
                          {recentSearches.map((recent, index) => (
                            <button
                              key={`recent-${index}`}
                              type="button"
                              onClick={() => {
                                setSearchTerm(recent)
                                handleSearchSubmit()
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-150 flex items-center justify-between group"
                              role="option"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{recent}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const updated = recentSearches.filter((_, i) => i !== index)
                                  setRecentSearches(updated)
                                  if (typeof window !== 'undefined') {
                                    localStorage.setItem('freelancer_recent_searches', JSON.stringify(updated))
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                                aria-label={`Remove ${recent} from recent searches`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Quick Category Chips */}
              <div className={`mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up ${styles.animateDelay2}`}>
                <span className="text-white/90 text-sm font-medium">Popular:</span>
                {['UI/UX Design', 'Web Development', 'Content Writing', 'Branding', 'SEO'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchTerm(category)}
                    className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-medium text-sm transition-all duration-200 hover:scale-105 hover:border-white/50 hover:shadow-lg shadow-white/10"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium Filters Section - Polished Product Grade */}
        <section className="sticky top-16 z-30 backdrop-blur-sm bg-[#0b0e13]/70 ring-1 ring-white/10 shadow-[0_6px_16px_rgba(0,0,0,.25)] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {/* Main Filter Row - Professional Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pb-4 border-b border-white/10">
              {/* Availability Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className={`${styles.filterLabel} text-white/70`}>AVAILABILITY</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Filter by availability"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available Now</option>
                  <option value="within_1_week">Available in 1 Week</option>
                  <option value="within_2_weeks">Available in 2 Weeks</option>
                </select>
              </div>

              {/* Rating Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className={`${styles.filterLabel} text-white/70`}>RATING</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Filter by rating"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5+">4.5+ Stars</option>
                  <option value="4.8+">4.8+ Stars</option>
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className={`${styles.filterLabel} text-white/70`}>EXPERIENCE</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Filter by experience level"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="senior">Senior (5-10 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>

              {/* Delivery Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className={`${styles.filterLabel} text-white/70`}>DELIVERY</label>
                <select
                  value={turnaroundFilter}
                  onChange={(e) => setTurnaroundFilter(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Filter by delivery speed"
                >
                  <option value="all">All Delivery Times</option>
                  <option value="24h">24 Hours</option>
                  <option value="48h">48 Hours</option>
                  <option value="3-5d">3-5 Days</option>
                  <option value="1-2w">1-2 Weeks</option>
                </select>
              </div>

              {/* Service Filter */}
              <div className="flex flex-col gap-1.5">
                <label className={`${styles.filterLabel} text-white/70`}>SERVICE</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Filter by service category"
                >
                  {serviceCategories.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex flex-col gap-1.5 ml-auto">
                <label className={`${styles.filterLabel} text-white/70`}>SORT</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterDropdown}
                  aria-label="Sort freelancers"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                  <option value="projects">Most Projects</option>
                  <option value="experience">Most Experience</option>
              </select>
              </div>
            </div>

            {/* Active Filters Summary - Premium Polish */}
            {activeFilters.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit">
                        <span className={`text-white/70 text-xs uppercase tracking-wide ${styles.filterLabel}`}>Active:</span>
                        {activeFilters.map((filter) => (
                          <button
                            key={filter.key}
                            onClick={filter.onRemove}
                            className={styles.chip}
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      {filter.label}
                      <span aria-hidden className="text-white/60 hover:text-white ml-1 transition-colors">×</span>
                    </button>
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 text-white/70 hover:text-white transition-colors text-xs uppercase tracking-wide"
                  >
                    Clear all
                  </button>
                </div>
                <span className="text-white/50 text-xs ml-3" aria-live="polite">
                  • {filteredFreelancers.length} {filteredFreelancers.length === 1 ? 'expert' : 'experts'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Stats Bar - Simplified Single Line */}
        <section className="relative bg-[#0c0f14] border-b border-white/10 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" style={{ opacity: 0.6 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {freelancers.length}+ verified experts
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Fast quotes
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure milestones
              </span>
            </div>
          </div>
        </section>

        {/* Freelancers Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-white/70">
              Showing <span className="font-semibold text-white">{filteredFreelancers.length}</span> freelancers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredFreelancers.map((freelancer) => {
              const countryCode = freelancer.country_code || getCountryCode(freelancer.country);
              const overlapHours = freelancer.overlap_hours || calculateOverlapHours(freelancer.timezone_offset);
              const turnaround = freelancer.turnaround_days 
                ? `≈${freelancer.turnaround_days * 24}h` 
                : freelancer.response_time || '≈72h';

              return (
              <div
                key={freelancer.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                  }}
              >
                  <div className="p-8">
                  {/* Header */}
                    <div className="flex items-start gap-5 mb-6">
                      <div className="relative flex-shrink-0">
                        {freelancer.avatar_url ? (
                          <img 
                            src={freelancer.avatar_url} 
                            alt={freelancer.display_name} 
                            className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/10" 
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-sky-500/30 to-violet-500/30 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/10">
                        {freelancer.display_name.charAt(0)}{freelancer.display_name.split(' ')[1]?.charAt(0) || ''}
                      </div>
                        )}
                        {freelancer.verification_state === 'verified' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#0c0f14] flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                  </div>
                    )}
                  </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">{freelancer.display_name}</h3>
                            <p className="text-white/70 text-base">{freelancer.headline || freelancer.title}</p>
                          </div>
                          <button 
                            aria-label="Shortlist" 
                            className="flex-shrink-0 rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                        {freelancer.country && (
                          <div className="inline-flex items-center gap-1.5 text-sm text-white/60">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M15 21v-2.5a2.5 2.5 0 00-5 0V21m5 0h2.945M18 18h2.945M21 15v-2.5a2.5 2.5 0 00-5 0V15m5 0h-2.945M15 3v2.5a2.5 2.5 0 005 0V3m-5 0h-2.945M12 3H9.055M9 5.5a2.5 2.5 0 005 0M9 5.5V3m0 0H5.055M21 18v2.945a2.5 2.5 0 01-2.5 2.5H15" />
                            </svg>
                            {freelancer.country}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Stats - Simplified */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                          <span className="text-white font-semibold text-base">{freelancer.rating.toFixed(1)}</span>
                          <span className="text-white/60 text-sm">({freelancer.total_reviews} reviews)</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                          <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {freelancer.completed_projects} projects
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          First concept {turnaround}
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Thumbnails - Optional, only if available */}
                    {freelancer.portfolio_thumbs && freelancer.portfolio_thumbs.length > 0 && (
                      <div className="mb-6 grid grid-cols-2 gap-3">
                        {freelancer.portfolio_thumbs.slice(0, 2).map((url, i) => (
                          <div key={i} className="relative overflow-hidden rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all aspect-video">
                            <img 
                              src={url} 
                              alt={`Portfolio ${i + 1}`}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                    </div>
                        ))}
                  </div>
                    )}

                    {/* Skills - Reduced */}
                    {freelancer.skills && freelancer.skills.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {freelancer.skills.slice(0, 4).map((skill) => (
                          <span 
                            key={skill} 
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                          >
                            {skill}
                          </span>
                        ))}
                        {freelancer.skills.length > 4 && (
                          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60">
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                    </div>
                    )}

                    {/* CTAs */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setSelectedFreelancer(freelancer.id);
                          setShowQuoteForm(true);
                        }}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] px-5 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
                      >
                        Request a Quote
                      </button>
                      <Link
                        href={`/freelancers/profile/${freelancer.id}`}
                        className="rounded-xl bg-white/10 px-5 py-3 text-base font-semibold text-white hover:bg-white/15 transition-all border border-white/10"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredFreelancers.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-white">No freelancers found</h3>
              <p className="mt-2 text-white/70">Try adding <span className="font-semibold">UI/UX</span>, <span className="font-semibold">SaaS</span>, or <span className="font-semibold">Mobile</span> filters.</p>
            </div>
          )}
        </section>

        {/* CTA Panel */}
        <section className="bg-white/5 border-t border-white/10 py-12">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Can't find the perfect match?
            </h2>
            <p className="text-lg text-white/70 mb-6">
              Post a project and get proposals in hours.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg"
            >
              Post a Project
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      {/* Quote Request Form Modal */}
      {showQuoteForm && (
        <QuoteRequestForm
          onClose={() => {
            setShowQuoteForm(false);
            setSelectedFreelancer(null);
          }}
          onSuccess={() => {
            setShowQuoteForm(false);
            setSelectedFreelancer(null);
          }}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch all approved freelancers with all new fields from MySQL database
    const freelancers = await query(`
      SELECT 
        f.id, 
        f.display_name,
        f.headline,
        f.title, 
        f.description, 
        f.country, 
        f.skills, 
        f.avatar_url,
        f.rating, 
        f.total_reviews, 
        f.completed_projects, 
        f.response_time, 
        f.availability,
        f.verification_state,
        f.experience_level,
        f.turnaround_days,
        f.timezone_offset,
        f.languages,
        f.industries,
        f.portfolio_thumbs,
        (
          SELECT JSON_ARRAYAGG(thumbnail_url)
          FROM portfolios p
          WHERE p.freelancer_id = f.id 
            AND p.is_public = 'TRUE'
          ORDER BY p.created_at DESC
          LIMIT 3
        ) as portfolio_thumbnails
      FROM freelancers f
      WHERE f.status = 'approved'
      ORDER BY f.rating DESC
    `);

    // Parse JSON fields and transform data
    const freelancersWithData = freelancers.map((freelancer: any) => {
      let parsedSkills: string[] = [];
      let parsedLanguages: string[] = [];
      let parsedIndustries: string[] = [];
      let parsedPortfolioThumbs: string[] = [];

      try {
        parsedSkills = typeof freelancer.skills === 'string' 
          ? JSON.parse(freelancer.skills) 
          : freelancer.skills || [];
      } catch (e) {
        parsedSkills = [];
      }

      try {
        parsedLanguages = typeof freelancer.languages === 'string' 
          ? JSON.parse(freelancer.languages) 
          : freelancer.languages || [];
      } catch (e) {
        parsedLanguages = [];
      }

      try {
        parsedIndustries = typeof freelancer.industries === 'string' 
          ? JSON.parse(freelancer.industries) 
          : freelancer.industries || [];
      } catch (e) {
        parsedIndustries = [];
      }

      // Use portfolio_thumbnails from query if available, otherwise use portfolio_thumbs
      let thumbUrls: string[] = [];
      try {
        if (freelancer.portfolio_thumbnails) {
          thumbUrls = typeof freelancer.portfolio_thumbnails === 'string'
            ? JSON.parse(freelancer.portfolio_thumbnails)
            : freelancer.portfolio_thumbnails || [];
        } else if (freelancer.portfolio_thumbs) {
          thumbUrls = typeof freelancer.portfolio_thumbs === 'string'
            ? JSON.parse(freelancer.portfolio_thumbs)
            : freelancer.portfolio_thumbs || [];
        }
      } catch (e) {
        thumbUrls = [];
      }

      return {
        id: String(freelancer.id),
        display_name: freelancer.display_name || '',
        headline: freelancer.headline || null,
        title: freelancer.title || '',
        description: freelancer.description || '',
        country: freelancer.country || null,
        skills: parsedSkills,
        avatar_url: freelancer.avatar_url || null,
        rating: Number(freelancer.rating) || 0,
        total_reviews: Number(freelancer.total_reviews) || 0,
        completed_projects: Number(freelancer.completed_projects) || 0,
        response_time: freelancer.response_time || null,
        availability: freelancer.availability || 'available',
        verification_state: freelancer.verification_state || null,
        experience_level: freelancer.experience_level || null,
        turnaround_days: freelancer.turnaround_days != null ? Number(freelancer.turnaround_days) : null,
        timezone_offset: freelancer.timezone_offset != null ? Number(freelancer.timezone_offset) : null,
        languages: parsedLanguages,
        industries: parsedIndustries,
        portfolio_thumbs: thumbUrls,
        portfolio_thumbnails: thumbUrls, // Alias for compatibility
      };
    });

    return {
      props: {
        freelancers: freelancersWithData,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        freelancers: [],
      },
    };
  }
}
