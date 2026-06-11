import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Send,
  SlidersHorizontal,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import Header from '../../src/components/Header';
import { useAuth } from '../../src/contexts/AuthContext';

const CATEGORIES = ['All', 'Design', 'Development', 'Marketing', 'Writing', 'Video', 'Data', 'Finance', 'General'];

const BUDGET_RANGES = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 – $2,000', min: 500, max: 2000 },
  { label: '$2,000 – $10,000', min: 2000, max: 10000 },
  { label: '$10,000+', min: 10000, max: Infinity },
];

const categoryColor: Record<string, string> = {
  Design: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  Development: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Marketing: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Writing: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Video: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Data: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Finance: 'bg-lime-500/15 text-lime-300 border-lime-500/25',
  General: 'bg-white/10 text-white/60 border-white/15',
};

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: string;
  budgetRaw: number;
  deadline: string;
  skills: string[];
  clientCompany: string | null;
  postedAgo: string;
};

type ProjectCardProps = Project & {
  showBudget: boolean;
  canApply: boolean;
  canApplyUnverified: boolean;
  isLoggedIn: boolean;
  isFreelancer: boolean;
  onApply: (project: Project) => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  category,
  budget,
  deadline,
  skills,
  clientCompany,
  postedAgo,
  showBudget,
  canApply,
  canApplyUnverified,
  isLoggedIn,
  isFreelancer,
  onApply,
  ...rest
}) => (
  <div className="group flex flex-col gap-4 rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/40">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] border border-white/10">
        <Briefcase className="h-5 w-5 text-cyan-300/80" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-white leading-snug group-hover:text-cyan-50 transition">
          {title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
              categoryColor[category] || 'bg-white/10 text-white/60 border-white/15'
            }`}
          >
            <Tag className="h-3 w-3" />
            {category}
          </span>
          {clientCompany && (
            <span className="text-[11px] text-white/35 font-medium">{clientCompany}</span>
          )}
        </div>
      </div>
    </div>

    <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{description || 'No description provided.'}</p>

    {skills.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/55"
          >
            {skill}
          </span>
        ))}
      </div>
    )}

    <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/8 pt-4">
      <div className="flex items-center gap-4 text-sm text-white/50">
        {deadline !== 'Flexible' && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-white/35" />
            {deadline}
          </span>
        )}
      </div>

      {canApply ? (
        <button
          onClick={() => onApply({ id, title, description, category, budget, budgetRaw: rest.budgetRaw, deadline, skills, clientCompany, postedAgo })}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          Apply <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ) : canApplyUnverified ? (
        /* Why: unverified freelancers get a clear path to verification instead of a dead end */
        <Link
          href="/verification"
          className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-300/50 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          Verify your account to apply
        </Link>
      ) : !isLoggedIn ? (
        <Link
          href="/login"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/60 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          Log in to apply
        </Link>
      ) : null}
    </div>

    <p className="text-[11px] text-white/28">{postedAgo}</p>
  </div>
);

export default function ProjectsPage() {
  const { user, verified, isFreelancer } = useAuth();
  const isLoggedInFreelancer = !!user && isFreelancer();
  const canApply = isLoggedInFreelancer && verified;
  const canApplyUnverified = isLoggedInFreelancer && !verified;
  const showBudget = false;

  // Apply modal state
  const [applyProject, setApplyProject] = useState<Project | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const openApply = (project: Project) => {
    setApplyProject(project);
    setCoverLetter('');
    setProposedRate('');
    setSubmitResult(null);
  };

  const closeApply = () => { setApplyProject(null); setSubmitResult(null); };

  const submitProposal = async () => {
    if (!coverLetter.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          projectId: applyProject?.id,
          message: coverLetter,
          proposedRate: proposedRate || null,
        }),
      });
      const data = await res.json();
      setSubmitResult({ ok: res.ok, msg: data.message || data.error || 'Unknown error' });
    } catch {
      setSubmitResult({ ok: false, msg: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [budgetRange, setBudgetRange] = useState('Any budget');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'All') params.set('category', activeCategory);
        if (search) params.set('search', search);

        const res = await fetch(`/api/projects/open?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        } else {
          setError(data.error || 'Failed to load projects');
        }
      } catch {
        setError('Unable to connect. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [activeCategory, search]);

  const selectedBudget = BUDGET_RANGES.find((r) => r.label === budgetRange) || BUDGET_RANGES[0];
  const filtered = projects.filter((p) =>
    budgetRange === 'Any budget'
      ? true
      : p.budgetRaw >= selectedBudget.min && p.budgetRaw < selectedBudget.max
  );

  return (
    <>
      <Head>
        <title>Open Projects - Unitiv</title>
        {/* Why: 150-160 char description + og tags (og:type/twitter:card are global in _app.tsx) */}
        <meta
          name="description"
          content="Browse open client projects on Unitiv across design, development, marketing, and more. Submit proposals, get hired, and get paid with milestone protection."
        />
        <meta property="og:title" content="Open Projects - Unitiv" />
        <meta
          property="og:description"
          content="Browse open client projects on Unitiv across design, development, marketing, and more. Submit proposals, get hired, and get paid with milestone protection."
        />
      </Head>

      <div className="min-h-screen bg-[#0B0D10]">
        <Header />

        {/* Why: semantic <main> landmark for screen readers and SEO */}
        <main>
        {/* Hero */}
        <section className="relative overflow-hidden text-white pt-24 pb-16 md:pt-28 md:pb-24 min-h-[72vh]">
          {/* Layered backgrounds — same as Freelancers page */}
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1019]/90 via-[#080d17]/75 to-[#060910]/95" />
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/images/freelancers-hero.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.28,
              filter: 'saturate(0.85)',
              mixBlendMode: 'screen',
            }}
          />
          {/* Aurora */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 22% 22%, rgba(0,198,255,0.12), transparent 55%), radial-gradient(circle at 78% 32%, rgba(125,42,232,0.10), transparent 55%), radial-gradient(circle at 50% 78%, rgba(8,17,36,0.45), transparent 65%)',
              filter: 'blur(42px)',
              opacity: 0.55,
              animation: 'auroraDrift 18s ease-in-out infinite alternate',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,15,0.55),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-20 h-44 rounded-[36px] bg-black/28 blur-3xl -z-10" />

            <div className="animate-fade-in-up">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/55 animate-fade-in-up">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                Open for Proposals
              </div>

              {/* Heading */}
              <h1
                className="mx-auto font-extrabold leading-[1.08] tracking-[-0.03em] animate-fade-in-up animate-delay-100 drop-shadow-[0_0_30px_rgba(0,198,255,.2)]"
                style={{ fontSize: 'clamp(40px,6.5vw,76px)' }}
              >
                Find Your{' '}
                <span className="hero-gradient-refined">Next Project</span>
              </h1>

              <p
                className="mx-auto mt-6 max-w-[560px] text-[rgba(234,238,246,0.80)] leading-relaxed animate-fade-in-up animate-delay-200 hero-tagline"
                style={{ fontSize: 'clamp(15px,1.6vw,18px)' }}
              >
                Browse projects posted by verified clients. Submit proposals, get hired, and get paid with milestone-based payment protection.
              </p>

              {/* Search */}
              <div className="mt-8 flex items-center justify-center animate-fade-in-up animate-delay-400">
                <div className="relative flex w-full max-w-[640px] items-center gap-3 rounded-full px-5 h-[52px] border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_16px_36px_rgba(8,18,36,0.42)] transition-all duration-300 focus-within:border-cyan-400/40 focus-within:shadow-[0_18px_44px_rgba(0,198,255,0.2)]">
                  <Search className="h-5 w-5 shrink-0 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search by skill, title, or keyword…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    maxLength={200}
                    aria-label="Search projects"
                    className="h-full flex-1 bg-transparent text-white font-medium text-[15px] outline-none tracking-wide search-input-field"
                  />
                  {/* Why: visible clear control when a search is active (UX + a11y) */}
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                      className="shrink-0 rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/40 animate-fade-in-up animate-delay-500">
                <span>
                  <strong className="text-white/65">{loading ? '—' : filtered.length}</strong> open projects
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>Milestone-based payments</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>No fees to apply</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="ml-auto flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Budget</p>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setBudgetRange(range.label)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      budgetRange === range.label
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'border border-white/10 text-white/45 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            /* Why: card-shaped skeletons instead of a bare spinner so the layout doesn't jump */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/10" />
                      <div className="h-3 w-1/3 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-white/10" />
                    <div className="h-3 w-5/6 rounded bg-white/10" />
                    <div className="h-3 w-2/3 rounded bg-white/10" />
                  </div>
                  <div className="mt-6 ml-auto h-9 w-24 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <Briefcase className="h-7 w-7 text-red-400/60" />
              </div>
              <p className="text-base font-semibold text-white/50">{error}</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); setBudgetRange('Any budget'); }}
                className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/55 transition hover:border-white/30 hover:text-white"
              >
                Reset filters
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="mb-5 text-sm text-white/35">
                {filtered.length} {filtered.length === 1 ? 'project' : 'projects'} found
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    showBudget={showBudget}
                    canApply={canApply}
                    canApplyUnverified={canApplyUnverified}
                    isLoggedIn={!!user}
                    isFreelancer={isLoggedInFreelancer}
                    onApply={openApply}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Search className="h-7 w-7 text-white/25" />
              </div>
              <p className="text-base font-semibold text-white/50">No open projects right now</p>
              <p className="mt-2 text-sm text-white/30">
                {search || activeCategory !== 'All' || budgetRange !== 'Any budget'
                  ? 'Try clearing your filters'
                  : 'Check back soon — new projects are posted daily'}
              </p>
              {(search || activeCategory !== 'All' || budgetRange !== 'Any budget') && (
                <button
                  onClick={() => { setSearch(''); setActiveCategory('All'); setBudgetRange('Any budget'); }}
                  className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/55 transition hover:border-white/30 hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* CTA for clients — hidden from freelancers */}
          {!isLoggedInFreelancer && <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">Are you a client?</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Post a project and get proposals fast</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
              Tell us what you need. Verified freelancers will send tailored proposals within hours.
            </p>
            <Link
              href="/projects"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:opacity-90 hover:-translate-y-0.5"
            >
              Post a Project <ChevronRight className="h-4 w-4" />
            </Link>
          </div>}
        </section>
        </main>
      </div>
      {/* Apply Modal */}
      {applyProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeApply(); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          {/* Why: dialog semantics + labelled icon-only close button for screen readers */}
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label={`Apply for ${applyProject.title}`} className="relative w-full max-w-lg rounded-2xl border border-white/12 bg-[#0e1420] shadow-2xl shadow-black/60 p-6">
            <button onClick={closeApply} aria-label="Close dialog" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
              <X className="h-4 w-4" />
            </button>

            {submitResult?.ok ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Proposal sent!</h3>
                <p className="text-sm text-white/55">Your proposal for <span className="text-white/80 font-semibold">{applyProject.title}</span> has been submitted. The client will review it shortly.</p>
                <button onClick={closeApply} className="mt-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-1">Applying for</p>
                  <h3 className="text-lg font-bold text-white leading-snug">{applyProject.title}</h3>
                  {applyProject.category && (
                    <span className="mt-1.5 inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white/50">{applyProject.category}</span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/70">Cover letter <span className="text-rose-400">*</span></label>
                    <textarea
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      maxLength={5000}
                      placeholder="Introduce yourself and explain why you're a great fit for this project…"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none focus:border-cyan-400/40 transition"
                    />
                    <p className="mt-1 text-right text-[11px] text-white/40">{coverLetter.length}/5000</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/70">Your proposed rate (AUD) <span className="text-white/30 font-normal">— optional</span></label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-cyan-400/40 transition">
                      <span className="text-white/40 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder="e.g. 2500"
                        className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {submitResult && !submitResult.ok && (
                  <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">{submitResult.msg}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button onClick={closeApply} className="flex-1 rounded-full border border-white/12 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:border-white/25 transition">
                    Cancel
                  </button>
                  <button
                    onClick={submitProposal}
                    disabled={submitting || !coverLetter.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? 'Sending…' : 'Send Proposal'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
