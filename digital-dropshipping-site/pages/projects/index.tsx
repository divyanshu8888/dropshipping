import { useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../../src/components/Header'
import { GetServerSideProps } from 'next'
import { query } from '../../src/lib/mysql'
import {
  COUNTRY_DIAL_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  combinePhone,
  ensureDialCodePrefix,
  findCountryOption,
  formatDialLabel,
} from '../../src/lib/phone'
import { projectQuoteClientSchema, projectQuoteSchema, formatZodErrors } from '../../src/lib/schemas/projectQuote'


type CategoryRecord = {
  id: number
  name: string
  slug: string
  description: string | null
}

interface ProjectPageProps {
  categories: CategoryRecord[]
}

type FormState = {
  clientName: string
  clientEmail: string
  clientPhone: string
  phoneCountryCode: string
  phoneLocal: string
  projectTitle: string
  projectDescription: string
  category: string
  notes: string
  budget: string
  timeline: string
}

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '1-month', label: '1 month' },
  { value: '2-months', label: '2 months' },
  { value: '3-months', label: '3+ months' },
  { value: 'flexible', label: 'Flexible' },
]

export default function ProjectsPage({ categories }: ProjectPageProps) {
  const mainFormRef = useRef<HTMLFormElement>(null)
  const [formState, setFormState] = useState<FormState>({
    clientName: '',
    clientEmail: '',
    clientPhone: ensureDialCodePrefix('', findCountryOption(DEFAULT_COUNTRY_CODE).dialCode),
    phoneCountryCode: DEFAULT_COUNTRY_CODE,
    phoneLocal: '',
    projectTitle: '',
    projectDescription: '',
    category: '',
    notes: '',
    budget: '',
    timeline: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'phoneLocal') {
      const nextState = (() => {
        const country = findCountryOption(formState.phoneCountryCode)
        const combined = combinePhone(country.dialCode, value)
        return {
          ...formState,
          phoneLocal: value,
          clientPhone: combined,
        }
      })()
      setFormState(nextState)
      if (hasSubmitted) {
        setFieldErrors(collectErrors(nextState))
      }
      return
    }

    const nextState = { ...formState, [name]: value }
    setFormState(nextState)
    if (hasSubmitted) {
      setFieldErrors(collectErrors(nextState))
    }
  }

  const handlePhoneCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = event.target.value
    const country = findCountryOption(countryCode)
    const nextState = {
      ...formState,
      phoneCountryCode: countryCode,
      clientPhone: combinePhone(country.dialCode, formState.phoneLocal),
    }
    setFormState(nextState)
    if (hasSubmitted) {
      setFieldErrors(collectErrors(nextState))
    }
  }

  const selectedCountry = useMemo(
    () => findCountryOption(formState.phoneCountryCode),
    [formState.phoneCountryCode],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const MAX_FILES = 5
    const MAX_SIZE_MB = 15
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']

    const existing = attachments.length
    const availableSlots = MAX_FILES - existing
    const selectedFiles = Array.from(files).slice(0, availableSlots)

    const oversize = selectedFiles.find((file) => file.size / (1024 * 1024) > MAX_SIZE_MB)
    if (oversize) {
      setError(`File \'${oversize.name}\' is larger than ${MAX_SIZE_MB}MB.`)
      event.target.value = ''
      return
    }

    const disallowed = selectedFiles.find((file) => !allowedTypes.includes(file.type))
    if (disallowed) {
      setError('Only PDF, JPG, or PNG files are allowed.')
      event.target.value = ''
      return
    }

    setAttachments((prev) => [...prev, ...selectedFiles])
    setError(null)
    event.target.value = ''
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const collectErrors = (state: FormState) => {
    const result = projectQuoteClientSchema.safeParse({
      clientName: state.clientName,
      clientEmail: state.clientEmail,
      clientPhone: state.clientPhone,
      phoneCountryCode: state.phoneCountryCode,
      projectTitle: state.projectTitle,
      projectDescription: state.projectDescription,
      budget: state.budget,
      timeline: state.timeline,
      category: state.category,
      notes: state.notes,
      phoneLocal: state.phoneLocal,
    })

    if (!result.success) {
      return formatZodErrors(result.error)
    }

    return {}
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setHasSubmitted(true)

    const errors = collectErrors(formState)
    if (errors.form) {
      setError(errors.form)
      delete errors.form
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields and try again.')
      const firstErrorKey = Object.keys(errors)[0]
      if (firstErrorKey) {
        const target = mainFormRef.current?.querySelector(`[name="${firstErrorKey}"]`) as
          | HTMLElement
          | null
        target?.focus()
      }
      return
    }

    setIsSubmitting(true)
    try {
      const basePayload = {
        clientName: formState.clientName,
        clientEmail: formState.clientEmail,
        clientPhone: formState.clientPhone.trim(),
        phoneCountryCode: formState.phoneCountryCode,
        projectTitle: formState.projectTitle,
        projectDescription: formState.projectDescription,
        budget: formState.budget,
        timeline: formState.timeline,
    category: formState.category || categories[0]?.slug || '',
        notes: formState.notes,
      }
      const parsedPayload = projectQuoteSchema.parse(basePayload)

      const categoryRecord = categories.find((category) => category.slug === parsedPayload.category)

      const formPayload = new FormData()
      formPayload.append('clientName', parsedPayload.clientName)
      formPayload.append('clientEmail', parsedPayload.clientEmail)
      formPayload.append('clientPhone', parsedPayload.clientPhone)
      formPayload.append('phoneCountryCode', parsedPayload.phoneCountryCode)
      formPayload.append('projectTitle', parsedPayload.projectTitle)
      formPayload.append('projectDescription', parsedPayload.projectDescription)
      formPayload.append('budget', parsedPayload.budget === null ? '' : String(parsedPayload.budget))
      formPayload.append('timeline', parsedPayload.timeline ?? '')
      formPayload.append('category', categoryRecord ? categoryRecord.name : parsedPayload.category)
      formPayload.append('notes', parsedPayload.notes ?? '')
      attachments.forEach((file) => {
        formPayload.append('attachments', file)
      })

      const response = await fetch('/api/quote-request', {
        method: 'POST',
        body: formPayload,
      })

      if (!response.ok) {
        const payload = await response.json()
        if (payload?.errors) {
          const mappedErrors = payload.errors as Record<string, string>
          if (mappedErrors.form) {
            setError(mappedErrors.form)
            delete mappedErrors.form
          }
          setFieldErrors(mappedErrors)
        }
        throw new Error(payload?.message ?? 'Failed to submit project request.')
      }

      setSuccess('Project submitted! Our admin team will review it soon and follow up with next steps.')
      setFormState({
        clientName: '',
        clientEmail: '',
        clientPhone: ensureDialCodePrefix('', findCountryOption(DEFAULT_COUNTRY_CODE).dialCode),
        phoneCountryCode: DEFAULT_COUNTRY_CODE,
        phoneLocal: '',
        projectTitle: '',
        projectDescription: '',
        category: '',
        notes: '',
        budget: '',
        timeline: '',
      })
      setAttachments([])
      setFieldErrors({})
      setHasSubmitted(false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Post a Project - Uniti</title>
        <meta name="description" content="Post a project and our admin team will match you with the right freelancers." />
      </Head>
      <div className="min-h-screen bg-[#080c16] text-white">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
              Project Brief
            </span>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">Tell us about the project you need help with</h1>
            <p className="mt-3 text-lg text-white/70">
              Submit your brief and our admin team will review it within a few hours. We&apos;ll notify you as soon
              as the right experts are lined up.
            </p>
          </div>

          <form
            ref={mainFormRef}
            onSubmit={handleSubmit}
            noValidate
            className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80">Your Name *</label>
                  <input
                    name="clientName"
                    value={formState.clientName}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className={`mt-2 w-full rounded-xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.clientName ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                  />
                  {fieldErrors.clientName && <p className="mt-1 text-xs text-rose-300">{fieldErrors.clientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80">Email *</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formState.clientEmail}
                    onChange={handleChange}
                    required
                    placeholder="you@company.com"
                    className={`mt-2 w-full rounded-xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.clientEmail ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                  />
                  {fieldErrors.clientEmail && <p className="mt-1 text-xs text-rose-300">{fieldErrors.clientEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80">Phone *</label>
                  <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="relative w-full md:w-56">
                      <select
                        name="phoneCountryCode"
                        value={formState.phoneCountryCode}
                        onChange={handlePhoneCountryChange}
                        className={`w-full appearance-none rounded-xl border bg-black/20 px-4 py-3 text-transparent outline-none transition focus:ring-2 ${fieldErrors.clientPhone ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                        style={{ color: 'transparent', textShadow: '0 0 0 transparent' }}
                      >
                        {COUNTRY_DIAL_OPTIONS.map((option) => (
                          <option
                            key={option.code}
                            value={option.code}
                            className="bg-[#080c16] text-white"
                          >
                            {formatDialLabel(option)}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white text-sm">
                        {selectedCountry.dialCode}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/60">▾</span>
                    </div>
                    <input
                      type="tel"
                      name="phoneLocal"
                      value={formState.phoneLocal}
                      onChange={handleChange}
                      placeholder="400 000 000"
                      className={`w-full rounded-xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.clientPhone ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                    />
                  </div>
                  {(fieldErrors.clientPhone || fieldErrors.phoneLocal) && (
                    <p className="mt-1 text-xs text-rose-300">
                      {fieldErrors.clientPhone ?? fieldErrors.phoneLocal}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80">Budget (USD)</label>
                  <input
                    type="number"
                    min="0"
                    name="budget"
                    value={formState.budget}
                    onChange={handleChange}
                    placeholder="5000"
                    className={`mt-2 w-full rounded-xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.budget ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                  />
                  {fieldErrors.budget && <p className="mt-1 text-xs text-rose-300">{fieldErrors.budget}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80">Project Title *</label>
                  <input
                    name="projectTitle"
                    value={formState.projectTitle}
                    onChange={handleChange}
                    required
                    placeholder="Example: Rebrand & launch campaign"
                    className={`mt-2 w-full rounded-xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.projectTitle ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                  />
                  {fieldErrors.projectTitle && <p className="mt-1 text-xs text-rose-300">{fieldErrors.projectTitle}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80">Category *</label>
                  <select
                    name="category"
                    value={formState.category}
                    onChange={handleChange}
                    required
                    className={`mt-2 w-full rounded-xl border bg-black/20 px-4 py-3 text-white outline-none transition focus:ring-2 ${fieldErrors.category ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug} className="bg-[#080c16] text-white">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="mt-1 text-xs text-rose-300">{fieldErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80">Timeline</label>
                  <select
                    name="timeline"
                    value={formState.timeline}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/60"
                  >
                    <option value="">Select timeline</option>
                    {TIMELINE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#080c16] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/80">Project Description *</label>
                <textarea
                  name="projectDescription"
                  value={formState.projectDescription}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Share the goals, deliverables, audience, and anything else our team should know."
                  className={`mt-2 w-full rounded-2xl border bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:ring-2 ${fieldErrors.projectDescription ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/60' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-500/60'}`}
                />
                {fieldErrors.projectDescription && <p className="mt-1 text-xs text-rose-300">{fieldErrors.projectDescription}</p>}
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Attach supporting files</p>
                    <p className="text-xs text-white/60">Up to 5 files · PDF, PNG, or JPG · Max 15MB each</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    {attachments.length > 0 ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} attached` : 'Upload files'}
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {attachments.map((file, index) => (
                      <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                        <span className="truncate pr-3">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {fieldErrors.attachments && (
                <p className="text-xs font-medium text-rose-300">{fieldErrors.attachments}</p>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/80">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formState.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share context, inspirations, or required tools."
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/60"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting…' : 'Post Project'}
              </button>
            </div>
          </form>

          <section className="relative mt-20 left-1/2 w-screen -translate-x-1/2 overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#080d18] to-[#060910] py-14 text-white shadow-[0_45px_140px_-70px_rgba(56,189,248,0.55)]">
            <div className="pointer-events-none absolute -left-40 top-8 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_rgba(0,198,255,0.22)_0%,rgba(6,9,16,0)_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(125,42,232,0.28)_0%,rgba(6,9,16,0)_72%)] blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:gap-16">
              <div className="flex-1 space-y-8">
                <header className="max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
                    Plan with Uniti
                  </span>
                  <h2 className="text-3xl font-semibold leading-tight md:text-[32px]">
                    Here’s what happens after you share your project.
                  </h2>
                  <p className="text-base text-white/70">
                    We guide every project from your brief to a short list of freelancers who fit the scope, budget, and timeline you specify.
                  </p>
                </header>

                <div className="grid gap-5 md:grid-cols-3">
                  {[{
                    title: 'Share the essentials',
                    copy: 'Tell us the goal, timeline, and anything already in progress. We keep the details organised for you.'
                  }, {
                    title: 'We shortlist for you',
                    copy: 'Our talent team reviews portfolios and recent work to surface a handful of suitable freelancers.'
                  }, {
                    title: 'Review and kick off',
                    copy: 'Pick who you like, agree on milestones, and start collaborating inside Uniti.'
                  }].map((item, index) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                        Step {index + 1}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/65">{item.copy}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/60">Need inspo?</h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/70">
                      <li><a className="hover:text-white" href="/how-it-works">How Uniti’s matching works</a></li>
                      <li><a className="hover:text-white" href="/case-studies">Recent client stories</a></li>
                      <li><a className="hover:text-white" href="/protection">Milestones & payment protection</a></li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/60">Quick tips</h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/70">
                      <li>Set a realistic budget range—our team will guide you if it needs adjusting.</li>
                      <li>Share any links or files that help explain the deliverables.</li>
                      <li>Prefer a quick chat? Add that note and we’ll schedule a call.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <aside className="flex w-full max-w-sm flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/55">Support when you need it</p>
                  <h3 className="text-xl font-semibold text-white">Want help writing the brief?</h3>
                  <p className="text-sm text-white/65">
                    Our talent coordinators can jump on a quick call, organise your notes, and send the project live.
                  </p>
                </div>
                <a
                  href="mailto:projects@uniti.com"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] px-5 py-3 text-sm font-semibold tracking-[0.16em] text-white shadow-[0_18px_40px_-28px_rgba(125,42,232,0.9)] transition hover:brightness-110"
                >
                  Email the team
                </a>
              </aside>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 bg-[#070a12]">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-white/55 md:flex-row">
            <p>© {new Date().getFullYear()} Uniti. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ProjectPageProps> = async () => {
  try {
    const categories = await query<CategoryRecord>(
      `
        SELECT id, name, slug, description
        FROM categories
        WHERE is_active = 'TRUE'
        ORDER BY display_order ASC, name ASC
      `,
    )

    return {
      props: {
        categories,
      },
    }
  } catch (error) {
    console.error('Failed to fetch categories for project form', error)
    return {
      props: {
        categories: [],
      },
    }
  }
}