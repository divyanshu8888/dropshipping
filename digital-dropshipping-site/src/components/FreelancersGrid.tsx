import Link from 'next/link'
import { useMemo, useState } from 'react'
import { buildQuoteHref } from '../lib/quoteLink'
import styles from '../styles/freelancers.module.css'

type Freelancer = {
  id: string
  display_name: string
  headline: string | null
  title: string
  description: string
  country: string | null
  skills: string[]
  avatar_url: string | null
  rating: number
  total_reviews: number
  completed_projects: number
  response_time: string | null
  availability: string
  verification_state: string
  experience_level?: 'intermediate' | 'senior' | 'expert'
  turnaround_days?: number
  timezone_offset?: number
  languages?: string[]
  industries?: string[]
  portfolio_thumbs?: string[]
  overlap_hours?: string
}

export default function FreelancersGrid({
  freelancers,
  viewMode,
  serviceFilter
}: {
  freelancers: Freelancer[]
  viewMode: 'grid' | 'list'
  serviceFilter: string
}) {
  const [countPulse, setCountPulse] = useState(false)

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

  const joinClasses = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ')

  const availabilityMeta = (availability: string | undefined) => {
    const raw = (availability || '').trim()
    const normalized = raw.toLowerCase()
    const label = raw.length > 0 ? raw.replace(/_/g, ' ') : 'Unknown'

    if (['available', 'available now', 'open', 'ready'].includes(normalized)) {
      return {
        label,
        tone: 'text-emerald-200',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-300/30',
        icon: (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 5.296a1 1 0 010 1.414l-7.004 7.005a1 1 0 01-1.414 0L4.296 9.725a1 1 0 011.414-1.414l3.004 3.004 6.297-6.297a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      }
    }

    if (['booked', 'busy', 'unavailable', 'not available', 'engaged'].includes(normalized)) {
      return {
        label,
        tone: 'text-amber-200',
        bg: 'bg-amber-500/15',
        border: 'border-amber-300/30',
        icon: (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    }

    return {
      label: label || 'Availability unknown',
      tone: 'text-white/70',
      bg: 'bg-white/8',
      border: 'border-white/15',
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const calculateOverlapHours = (timezoneOffset: number | undefined): string => {
    if (!timezoneOffset) return '4–6h'
    const offsetHours = Math.abs(timezoneOffset / 60)
    if (offsetHours <= 2) return '6–8h'
    if (offsetHours <= 4) return '4–6h'
    if (offsetHours <= 6) return '2–4h'
    return '1–2h'
  }

  useMemo(() => {
    setCountPulse(true)
    const t = window.setTimeout(() => setCountPulse(false), 280)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancers.length])

  return (
    <section className={`${styles.resultsSection} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 md:pt-3`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm md:text-base text-white/70">
          Showing{' '}
          <span className={countPulse ? 'font-semibold text-sky-300 transition-colors duration-200' : 'font-semibold text-white transition-colors duration-200'}>
            {freelancers.length}
          </span>{' '}
          freelancers
        </p>
      </div>
      <div
        className={`${styles.resultsGridRefresh} ${viewMode === 'list' ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8'}`}
      >
        {freelancers.map((freelancer) => {
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
          const isTopRated = ratingValue !== null && ratingValue >= 4.8 && (reviewCount ?? 0) >= 10;
          const availabilityInfo = availabilityMeta(freelancer.availability);

          return (
            <div
              key={freelancer.id}
              className={`group relative overflow-hidden rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${viewMode === 'list' ? 'md:flex md:items-stretch' : ''}`}
              style={{ boxShadow: '0 16px 38px -24px rgba(8, 13, 24, 0.55)' }}
            >
              <div className="flex flex-col gap-4 p-6">
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

                <div className="grid grid-cols-1 gap-y-1.5 text-[11px] leading-tight text-white/75 sm:grid-cols-2 md:flex md:flex-wrap md:items-center md:gap-x-3 md:gap-y-0 md:text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-white whitespace-nowrap">{formatRating(numOrNull(freelancer.rating))}</span>
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
                        New to Unitiv
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
                </div>

                {portfolioImages.length > 0 ? (
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

                <div className="mt-3 flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
                  <Link
                    href={buildQuoteHref({
                      source: 'freelancer',
                      intent: 'samples',
                      title: `Sample request · ${freelancer.display_name}`,
                      subtitle: freelancer.headline || freelancer.title || undefined,
                      badge: freelancer.country || undefined,
                      meta: isNewFreelancer
                        ? 'New to Unitiv'
                        : `${formatRating(numOrNull(freelancer.rating))} · ${formatInteger(projectCount)} projects`,
                      category: serviceFilter !== 'all' ? serviceFilter : undefined
                    })}
                    className="text-sm font-semibold text-white/70 underline-offset-4 transition hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                  >
                    Ask for samples
                  </Link>
                  <Link
                    href={buildQuoteHref({
                      source: 'freelancer',
                      intent: 'proposal',
                      title: `Proposal with ${freelancer.display_name}`,
                      subtitle: freelancer.headline || freelancer.title || undefined,
                      badge: freelancer.country || undefined,
                      meta: `${formatRating(numOrNull(freelancer.rating))} · ${projectCount ?? 0} projects`,
                      category: serviceFilter !== 'all' ? serviceFilter : undefined
                    })}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:max-w-[62%]"
                  >
                    Request Proposal
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {freelancers.length === 0 && (
        <div className="text-center py-16">
          <svg className="mx-auto h-24 w-24 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-white">No freelancers found</h3>
          <p className="mt-2 text-white/70">Try adding <span className="font-semibold">UI/UX</span>, <span className="font-semibold">SaaS</span>, or <span className="font-semibold">Mobile</span> filters.</p>
        </div>
      )}
    </section>
  )
}


