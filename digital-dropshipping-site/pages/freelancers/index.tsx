import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { buildQuoteHref } from '../../src/lib/quoteLink'
import type { FilterControlDescriptor } from '../../src/components/UnitiFilters'
const Header = dynamic(() => import('../../src/components/Header'))
const UnitiFilters = dynamic(() => import('../../src/components/UnitiFilters'), { ssr: false })
import { query } from '../../src/lib/mysql'
import { parseAvailability } from '../../src/lib/availability'
import { formatAvailabilityDisplay } from '../../src/lib/availabilityDisplay'
import styles from '../../src/styles/freelancers.module.css'

interface Freelancer {
  id: string;
  display_name: string;
  headline: string | null;
  title: string;
  description: string;
  country: string | null;
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
  portfolio_thumbnails?: string[];
  // Calculated fields
  overlap_hours?: string;
}

interface FreelancersPageProps {
  freelancers: Freelancer[];
  initialSearchTerm?: string;
}

type HeroTrustBadge = {
  label: string;
  icon: ReactNode;
};

const numOrNull = (value: unknown): number | null => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const formatRating = (value: number | null): string => {
  if (value === null) return '—'
  return value.toFixed(1)
}

const formatInteger = (value: number | null): string => {
  if (value === null) return '—'
  return `${Math.round(value)}`
}

const parseMediaArray = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object' && 'thumbnail_url' in item) {
          return String((item as Record<string, unknown>).thumbnail_url || '').trim()
        }
        if (item && typeof item === 'object' && 'url' in item) {
          return String((item as Record<string, unknown>).url || '').trim()
        }
        return ''
      })
      .filter((url) => url.length > 0)
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseMediaArray(parsed)
    } catch (error) {
      // handle comma-separated strings
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((url) => url.length > 0)
    }
  }
  return []
}

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const availabilityMeta = (availability: string | undefined) => {
  const parsed = parseAvailability(availability)
  return formatAvailabilityDisplay(parsed)
}

const FreelancerSkills = ({ skills }: { skills: string[] }) => {
  const [expanded, setExpanded] = useState(false)

  if (!skills || skills.length === 0) {
    return null
  }

  const visibleSkills = expanded ? skills : skills.slice(0, 3)
  const remainingCount = skills.length - visibleSkills.length

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleSkills.map((skill) => (
        <span
          key={skill}
          className="rounded-lg border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-white/85"
        >
          {skill}
        </span>
      ))}
      {remainingCount > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-lg border border-white/12 bg-transparent px-3 py-1 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          More
        </button>
      )}
      {expanded && skills.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-lg border border-white/12 bg-transparent px-3 py-1 text-xs font-semibold text-white/50 hover:text-white/80 transition"
        >
          Show less
        </button>
      )}
    </div>
  )
}

const heroTrustBadges: HeroTrustBadge[] = [
  {
    label: 'Verified Portfolios',
    icon: (
      <svg className="w-4 h-4 text-brand-b" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l6 3v5c0 3.866-2.686 7.5-6 8.5-3.314-1-6-4.634-6-8.5V6l6-3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9.75 12.5l1.75 1.75 2.75-2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Fast Response Times',
    icon: (
      <svg className="w-4 h-4 text-brand-b" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12a7 7 0 1111.31 5.31L19 20l-2 2-2.69-2.69A7 7 0 015 12z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 8v4l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Top-Rated Professionals',
    icon: (
      <svg className="w-4 h-4 text-brand-b" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4l2.09 4.24L19 9.27l-3.5 3.42L16.18 18 12 15.9 7.82 18l.68-5.31L5 9.27l4.91-.03L12 4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function FreelancersPage({ freelancers, initialSearchTerm }: FreelancersPageProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const lastQueryRef = useRef(initialSearchTerm || '')
 
  const runSearch = (rawTerm: string) => {
    const trimmed = rawTerm.trim()

    setSearchTerm(trimmed)

    if (trimmed) {
      setRecentSearches(prev => {
        const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 5)
        if (typeof window !== 'undefined') {
          localStorage.setItem('freelancer_recent_searches', JSON.stringify(updated))
        }
        return updated
      })
    }

    const currentQueryValue = typeof router.query.search === 'string' ? router.query.search : ''
    const nextQuery = { ...router.query }
    if (trimmed) {
      nextQuery.search = trimmed
    } else {
      delete nextQuery.search
    }

    const shouldUpdateRoute = trimmed !== currentQueryValue || (!trimmed && typeof router.query.search === 'string')

    lastQueryRef.current = trimmed
    if (shouldUpdateRoute) {
      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true, scroll: false })
    }

    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }
  
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
 
  useEffect(() => {
    if (!router.isReady) return
    const querySearch = typeof router.query.search === 'string' ? router.query.search : ''
    if (lastQueryRef.current === querySearch) return
    lastQueryRef.current = querySearch
    setSearchTerm(querySearch)
  }, [router.isReady, router.query.search])
  
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
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [countPulse, setCountPulse] = useState(false)

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

  const filterControls: FilterControlDescriptor[] = [
    {
      id: 'availability-filter',
      label: 'Availability',
      shortLabel: 'Avail',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a7 7 0 0111.31-5.31L19 9m0 0l-2.69 2.31A7 7 0 015 12z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 15h14" />
        </svg>
      ),
      value: availabilityFilter,
      defaultValue: 'all',
      onChange: (val: string) => setAvailabilityFilter(val),
      options: [
        { value: 'all', label: 'All Availability' },
        { value: 'available', label: 'Available Now' },
        { value: 'within_1_week', label: 'Available in 1 Week' },
        { value: 'within_2_weeks', label: 'Available in 2 Weeks' },
      ],
    },
    {
      id: 'service-filter',
      label: 'Service',
      shortLabel: 'Service',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3a6 6 0 104.5 10.25L21 18l-3 3-6.75-6.75A6 6 0 109.75 3z" />
        </svg>
      ),
      value: serviceFilter,
      defaultValue: 'all',
      onChange: (val: string) => setServiceFilter(val),
      options: serviceCategories.map((service) => ({
        value: service.value,
        label: service.label,
      })),
    },
    {
      id: 'experience-filter',
      label: 'Experience',
      shortLabel: 'Exp',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: experienceFilter,
      defaultValue: 'all',
      onChange: (val: string) => setExperienceFilter(val),
      options: [
        { value: 'all', label: 'All Experience Levels' },
        { value: 'intermediate', label: 'Intermediate (2-5 years)' },
        { value: 'senior', label: 'Senior (5-10 years)' },
        { value: 'expert', label: 'Expert (10+ years)' },
      ],
    },
    {
      id: 'rating-filter',
      label: 'Rating',
      shortLabel: 'Rating',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
      value: ratingFilter,
      defaultValue: 'all',
      onChange: (val: string) => setRatingFilter(val),
      options: [
        { value: 'all', label: 'All Ratings' },
        { value: '4.5+', label: '4.5+ Stars' },
        { value: '4.8+', label: '4.8+ Stars' },
      ],
    },
    {
      id: 'sort-filter',
      label: 'Sort',
      shortLabel: 'Sort',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M6 12h12M10 18h8" />
        </svg>
      ),
      value: sortBy,
      defaultValue: 'rating',
      onChange: (val: string) => setSortBy(val),
      options: [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'reviews', label: 'Most Reviews' },
        { value: 'projects', label: 'Most Projects' },
        { value: 'experience', label: 'Most Experience' },
      ],
    },
  ]

  const clearAllFilters = () => {
    setAvailabilityFilter('all')
    setExperienceFilter('all')
    setRatingFilter('all')
    setServiceFilter('all')
  }

  // Handle search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    runSearch(searchTerm)
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
        runSearch(suggestions[selectedSuggestionIndex])
      } else {
        handleSearchSubmit()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }
  
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
             matchesRating && matchesService
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
  }, [freelancers, searchTerm, availabilityFilter, experienceFilter, ratingFilter, serviceFilter, sortBy, serviceCategories])

  useEffect(() => {
    setCountPulse(true)
    const timeout = window.setTimeout(() => setCountPulse(false), 280)
    return () => window.clearTimeout(timeout)
  }, [filteredFreelancers.length])

  return (
    <>
      <Head>
        <title>Find Freelancers - Uniti</title>
        <meta name="description" content="Browse verified freelancers and hire top talent for your projects" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10]">
        <Header />

        {/* Hero Section - Enhanced Professional Design */}
        <section className="relative overflow-hidden text-white pt-24 pb-18 md:pt-28 md:pb-24 min-h-[78vh]">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1019]/90 via-[#080d17]/75 to-[#060910]/95" />
          <div className={`absolute inset-0 ${styles.heroImageOverlay}`} />
          <div className={`absolute inset-0 ${styles.heroAurora}`} />
          <div className={`absolute inset-0 ${styles.heroNoise}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,15,0.55),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-20 h-44 rounded-[36px] bg-black/28 blur-3xl -z-10" />
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="mx-auto font-extrabold text-[clamp(32px,5.2vw,52px)] leading-[1.12] tracking-tight animate-fade-in-up animate-delay-100 drop-shadow-none md:drop-shadow-[0_0_18px_rgba(70,105,255,.24)]">
                Find the{' '}
                <span className={styles.heroGradient}>
                  Perfect Freelancer
                </span>
              </h1>
              <p className="mx-auto mt-5 text-[clamp(14px,1.5vw,16px)] max-w-[600px] text-[rgba(234,238,246,0.92)] fadeUp animateDelay2 hero-tagline leading-relaxed">
                Discover top-rated professionals ready to design, build, and scale your vision
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-12 animate-fade-in-up animate-delay-300 text-text-soft">
              {heroTrustBadges.map((badge) => (
                <div key={badge.label} className={styles.trustBadge}>
                  <span className={styles.trustBadgeIcon}>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
              </div>
              
            <div className="mt-6 flex items-center justify-center animate-fade-in-up animate-delay-400" ref={searchRef}>
              <form
                onSubmit={handleSearchSubmit}
                className={`relative z-20 flex w-full max-w-[700px] items-center gap-3 rounded-full px-5 h-[52px] border border-white/15 shadow-[0_16px_36px_rgba(8,18,36,0.42)] transition-all duration-300 focus-within:border-brand-b/40 focus-within:shadow-[0_18px_44px_rgba(73,126,227,0.3)] ${styles.heroSearchForm}`}
              >
                <svg className="h-5 w-5 text-white/70 shrink-0" viewBox="0 0 24 24" fill="none">
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
                  className="h-full flex-1 bg-transparent text-slate-100 font-medium text-[15px] placeholder-slate-300 outline-none tracking-wide focus-visible:outline-none"
                    placeholder="Try 'Web Designer', 'Logo Animation', or 'SEO Audit'..."
                  />
                  <button
                    type="submit"
                  className="shrink-0 h-[40px] px-6 rounded-full text-white font-semibold transition-all text-sm bg-[#3E5BF1] hover:bg-[#334fe6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7aa2ff]/40 focus-visible:ring-offset-0"
                    >
                    Search
                  </button>
                  
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
                              onClick={() => runSearch(suggestion)}
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
                              onClick={() => runSearch(recent)}
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
            <div className={`mt-10 flex justify-center animate-fade-in-up animate-delay-500`}>
              <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-[0.4em]">
                <span>Scroll to explore</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white/60 bounce-slow">
                  ↓
                </span>
              </div>
            </div>
          </div>
        </section>

        <UnitiFilters
          variant="glass"
          controls={filterControls}
          onClearAll={clearAllFilters}
        />

        {/* Freelancers Grid */}
        <section className={`${styles.resultsSection} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 md:pt-3`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm md:text-base text-white/70">
              Showing{' '}
              <span className={countPulse ? 'font-semibold text-sky-300 transition-colors duration-200' : 'font-semibold text-white transition-colors duration-200'}>
                {filteredFreelancers.length}
              </span>{' '}
              freelancers
            </p>
            <div className={styles.viewToggle}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`${styles.viewToggleButton} ${viewMode === 'grid' ? styles.viewToggleButtonActive : ''}`}
                aria-pressed={viewMode === 'grid'}
                aria-label="Grid view"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="6.4" height="6.4" rx="1.2" />
                  <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.2" />
                  <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.2" />
                  <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.2" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.viewToggleButtonActive : ''}`}
                aria-pressed={viewMode === 'list'}
                aria-label="List view"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5.2" y="6" width="13.6" height="2.2" rx="1.1" />
                  <rect x="5.2" y="11.4" width="13.6" height="2.2" rx="1.1" />
                  <rect x="5.2" y="16.8" width="13.6" height="2.2" rx="1.1" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className={`${styles.resultsGridRefresh} ${viewMode === 'list' ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8'}`}
          >
            {filteredFreelancers.map((freelancer) => {
              const turnaround = freelancer.turnaround_days
                ? `≈${freelancer.turnaround_days * 24}h` 
                : freelancer.response_time || '≈72h';
              const isVerified = freelancer.verification_state === 'verified';
              const countryLabel = freelancer.country || 'Remote';
              const portfolioImages: string[] = Array.isArray(freelancer.portfolio_thumbs)
                ? (freelancer.portfolio_thumbs as string[])
                : [];
            const projectCount = numOrNull(freelancer.completed_projects);
            const reviewCount = numOrNull(freelancer.total_reviews);
            const ratingValue = numOrNull(freelancer.rating);
            const isNewFreelancer = !projectCount || projectCount === 0;
            const hasPortfolio = portfolioImages.length > 0;
            const isTopRated = ratingValue !== null && ratingValue >= 4.8 && (reviewCount ?? 0) >= 10;
            const availabilityInfo = availabilityMeta(freelancer.availability);

              return (
              <div
                key={freelancer.id}
                  className={`group relative overflow-hidden rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${viewMode === 'list' ? 'md:flex md:items-stretch' : ''}`}
                  style={{
                    boxShadow: '0 16px 38px -24px rgba(8, 13, 24, 0.55)'
                  }}
              >
                  <div className="flex flex-col gap-4 p-6">
                  {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative h-14 w-14 flex-shrink-0">
                        {freelancer.avatar_url ? (
                          <img 
                            src={freelancer.avatar_url} 
                            alt={freelancer.display_name} 
                            className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/10" 
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-500/30 to-violet-500/30 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/10">
                        {freelancer.display_name.charAt(0)}{freelancer.display_name.split(' ')[1]?.charAt(0) || ''}
                      </div>
                        )}
                        {isTopRated && (
                          <span className="absolute -top-2 left-0 rounded-full border border-cyan-300/40 bg-cyan-400/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-50 shadow-[0_4px_12px_rgba(56,189,248,0.35)]">
                            Top
                          </span>
                        )}
                        {isVerified && (
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0c121d] bg-[#1d9bf0] shadow-[0_4px_12px_rgba(29,155,240,0.5)]">
                            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9.55 16.8a.75.75 0 01-1.06 0l-3.29-3.29a.75.75 0 011.06-1.06l2.76 2.76 5.68-5.68a.75.75 0 011.06 1.06l-6.21 6.21z" />
                            </svg>
                  </div>
                    )}
                  </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/freelancers/profile/${freelancer.id}`}
                                className="truncate text-lg md:text-xl font-semibold text-white hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                              >
                                {freelancer.display_name}
                              </Link>
                              {isTopRated && (
                                <span className="md:hidden inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                  Top
                                </span>
                              )}
                              {!isTopRated && isNewFreelancer && (
                                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 text-xs md:text-sm text-white/70">
                              <span className="truncate">{freelancer.headline || freelancer.title}</span>
                              {freelancer.country && (
                                <span className="flex items-center gap-1 text-[12px] text-white/60">
                                  <svg className="h-3.5 w-3.5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="truncate">{countryLabel}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            aria-label="Shortlist" 
                            className="flex-shrink-0 rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 gap-y-1.5 text-[11px] leading-tight text-white/75 sm:grid-cols-2 md:flex md:flex-wrap md:items-center md:gap-x-3 md:gap-y-0 md:text-[12px]">
                        <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-white whitespace-nowrap">{formatRating(ratingValue)}</span>
                        {reviewCount !== null ? (
                          <span className="text-white/55">({Math.round(reviewCount)})</span>
                        ) : null}
                        </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        {isNewFreelancer ? (
                          <span className="rounded-full border border-cyan-300/35 bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                            New to Uniti
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-white whitespace-nowrap">{formatInteger(projectCount)}</span>
                            <span className="text-white/55">projects</span>
                          </>
                        )}
                        </div>
                        <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        <span className="font-semibold text-white whitespace-nowrap">{turnaround}</span>
                        <span className="text-white/55 whitespace-nowrap">first concept</span>
                        </div>
                      </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-white/55 sm:text-xs">
                        <span>Availability</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={joinClasses(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]',
                            availabilityInfo.bg,
                            availabilityInfo.border,
                            availabilityInfo.tone
                          )}
                        >
                          {availabilityInfo.icon}
                          <span className="whitespace-nowrap">{availabilityInfo.label}</span>
                        </span>
                        {availabilityInfo.subtitle && (
                          <span className="text-[9px] text-white/50 whitespace-nowrap">
                            {availabilityInfo.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Portfolio Thumbnails - Optional, only if available */}
                    {hasPortfolio ? (
                      <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/10">
                        <img 
                          src={portfolioImages[0]} 
                          alt={`Portfolio preview for ${freelancer.display_name}`}
                          className="h-[160px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {portfolioImages.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between bg-gradient-to-b from-transparent via-black/35 to-black/65 px-4 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                              View portfolio
                            </span>
                            <span className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/90">
                              +{portfolioImages.length - 1} more
                            </span>
                    </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[160px] rounded-[14px] border border-dashed border-white/18 bg-white/3 flex flex-col items-center justify-center text-white/60">
                        <svg className="h-7 w-7 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M5 6h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
                        </svg>
                        <span className="mt-2 text-sm font-semibold text-white/70">No portfolio yet</span>
                        <span className="text-xs text-white/50">Ask for samples</span>
                  </div>
                    )}

                    {/* Skills - Reduced */}
                    {freelancer.skills && freelancer.skills.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <FreelancerSkills skills={freelancer.skills} />
                    </div>
                    )}

                    {/* CTAs */}
                    <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Link
                        href={buildQuoteHref({
                          source: 'freelancer',
                          intent: 'proposal',
                          title: `Proposal with ${freelancer.display_name}`,
                          subtitle: freelancer.headline || freelancer.title || undefined,
                          badge: freelancer.country || undefined,
                          meta: `${formatRating(ratingValue)} · ${projectCount ?? 0} projects`,
                          category: serviceFilter !== 'all' ? serviceFilter : undefined,
                          freelancerId: freelancer.id,
                          freelancerName: freelancer.display_name
                        })}
                        className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 px-5 h-12 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 whitespace-nowrap"
                      >
                        Request Proposal
                      </Link>
                      <Link
                        href={buildQuoteHref({
                          source: 'freelancer',
                          intent: 'samples',
                          title: `Sample request · ${freelancer.display_name}`,
                          subtitle: freelancer.headline || freelancer.title || undefined,
                          badge: freelancer.country || undefined,
                          meta: isNewFreelancer
                            ? 'New to Uniti'
                            : `${formatRating(ratingValue)} · ${formatInteger(projectCount)} projects`,
                          category: serviceFilter !== 'all' ? serviceFilter : undefined,
                          freelancerId: freelancer.id,
                          freelancerName: freelancer.display_name
                        })}
                        className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 h-12 text-sm font-semibold text-white/90 hover:text-white hover:border-white/40 hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-white/20 whitespace-nowrap"
                      >
                        Ask for samples
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
        <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-[#090F1A] via-[#070C16] to-[#060910] py-14">
          <div className="pointer-events-none absolute -left-28 top-1/2 h-[18rem] w-[18rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(0,198,255,0.25)_0%,rgba(13,17,28,0)_72%)] blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-12 h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,_rgba(125,42,232,0.28)_0%,rgba(13,17,28,0)_68%)] blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-[11px] uppercase tracking-[0.36em] text-white/55">Need help choosing?</p>
              <h2 className="bg-gradient-to-r from-[#E3F6FF] via-white to-[#C6D5FF] bg-clip-text text-3xl font-semibold leading-tight text-transparent md:text-[32px]">
                Didn’t find the perfect match? We’ll shortlist great freelancers for you.
            </h2>
              <p className="text-sm text-white/70">
                Tell us what you need, and our team will send you a few vetted options.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  ✨ We do the matching
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  ✓ Identity verified
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  🔐 Escrow-ready
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/projects"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] px-6 py-3 text-sm font-semibold tracking-[0.16em] text-white shadow-[0_18px_40px_-22px_rgba(0,198,255,0.65)] transition hover:shadow-[0_28px_70px_-26px_rgba(125,42,232,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              Post a Project
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm">💬</span>
                  Talk to a talent advisor
            </Link>
              </div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Free to post · No obligation · Most projects matched within 24h
              </p>
            </div>

            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:ml-auto">
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/65">
                  Match queue
                </span>
                <span className="text-xs text-white/45">Sample workflow</span>
              </div>
              <div className="space-y-4 text-sm text-white/70">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Active brief</p>
                  <p className="mt-1 text-base font-semibold text-white">New client project</p>
                  <p className="text-white/60">Our team is screening a shortlist of freelancers</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/55">
                    <span>Current step</span>
                    <span className="font-semibold text-white">Shortlisting</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-white/10">
                    <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8]" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full border border-white/15 bg-white/10" />
                  <div>
                    <p className="text-sm font-semibold text-white">Talent review team</p>
                    <p className="text-xs text-white/60">Checking portfolios, recent work, and availability.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-100">
                “Share your brief and we’ll bring back 2–3 freelancers who are a strong fit.”
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#080C16]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/60 md:flex-row">
            <p>© {new Date().getFullYear()} Uniti. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Quote Request Form Modal */}
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fast-fail when DB is not configured (keeps dev fast)
    if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      return {
        props: {
          freelancers: [],
          initialSearchTerm: '',
        },
        revalidate: 60,
      }
    }
    // Fetch all approved freelancers with all new fields from MySQL database
    const freelancersPromise = query(`
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
        AND f.verification_state = 'verified'
      ORDER BY f.rating DESC
      LIMIT 60
    `)
    // Hard timeout to avoid long stalls in dev
    const freelancers = await Promise.race<any[]>([
      freelancersPromise,
      new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1200))
    ])

    const normalizedFreelancers = (freelancers as any[]).map((freelancer) => {
      const skills = parseMediaArray(freelancer.skills)
      const languages = parseMediaArray(freelancer.languages)
      const industries = parseMediaArray(freelancer.industries)
      const portfolioThumbs = parseMediaArray(freelancer.portfolio_thumbs)
      const portfolioExtra = parseMediaArray((freelancer as any).portfolio_thumbnails)
      const portfolio = Array.from(new Set([...portfolioThumbs, ...portfolioExtra]))

      return {
        ...freelancer,
        skills,
        languages,
        industries,
        portfolio_thumbs: portfolio
      }
    })

    return {
      props: {
        freelancers: normalizedFreelancers,
        initialSearchTerm: '',
      },
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error fetching freelancers', error)
    return {
      props: {
        freelancers: [],
        initialSearchTerm: '',
      },
      revalidate: 60,
  }
}
}