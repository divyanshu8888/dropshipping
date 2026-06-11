# Unitiv Website Full Improvement Prompt

---

## MASTER CONTEXT

You are a senior full-stack engineer, UI/UX designer, and security specialist working on **Unitiv** — a freelance marketplace platform built with **Next.js 14 (Pages Router) + TypeScript + Tailwind CSS + MySQL2**. The site connects clients with verified freelancers and has full role-based access control.

### Tech Stack
- **Framework**: Next.js 14, Pages Router, TypeScript
- **Styling**: Tailwind CSS + global CSS (`src/styles/globals.css`)
- **Auth**: Custom JWT-based auth via `src/contexts/AuthContext.tsx` — exposes `user`, `verified`, `isFreelancer()`, `isClient()`, `isAdmin()`
- **Database**: MySQL via `lib/mysql.ts` with `query()` and `queryOne()` helpers
- **Key pages**: `/`, `/freelancers`, `/open-projects`, `/products`, `/products/[id]`, `/freelancers/profile/[id]`, `/login`, `/signup`, `/dashboard`, `/freelancers/dashboard`, `/clients/dashboard`, `/admin`, `/request-quote`, `/how-it-works`, `/about`, `/contact`, `/apply`, and more
- **Roles**: `ADMIN`, `TEAM_MEMBER`, `FREELANCER`, `CLIENT` — all served different UI/navigation
- **Design language**: Dark theme (#141414 base), cyan/violet gradient accents, `rounded-[20-28px]` cards, `border-white/10–12` card borders

### Role-Based Rules Already in Place
- Freelancers do NOT see: "Request Proposal", "Ask for samples", "Post a Project", "Browse Playbooks", "Request a Custom Brief", "View Scope", "Start quote", "Request custom quote", hero CTA buttons on `/products`
- Budget/price is hidden from everyone on `/open-projects`
- Apply button on `/open-projects` is gated behind freelancer login + verification check
- Header dropdown is solid `#141414`

---

## YOUR TASK

You are to perform a **comprehensive, systematic improvement pass** on this entire codebase. Do NOT skip pages or components. Do NOT break any existing page. Your improvements should span EVERY dimension listed below.

For each change you make, briefly comment in the code WHY you made it (one-line comment is enough).

---

## DIMENSION 1 — SECURITY

Audit and fix every security vulnerability across the entire codebase:

**Authentication & Authorization**
- Verify ALL API routes check authentication before processing. Add `401` guards where missing.
- Verify role checks on sensitive API endpoints (`/api/admin/*`, `/api/proposals`, `/api/projects/*`). A freelancer must not be able to call client-only endpoints even via direct fetch.
- Ensure JWTs are validated server-side on every protected API route — not just client-side redirects.
- Check for missing `httpOnly` flags on auth cookies. If using localStorage for tokens, flag this as a security risk and migrate to `httpOnly` cookies.
- Add CSRF protection on all state-mutating API routes (POST/PUT/DELETE).

**Input Validation & Injection**
- Every `query()` call must use parameterized queries. Scan for any string interpolation directly into SQL and replace with `?` parameters.
- Validate and sanitize all user inputs on the server side — not just client-side. Use a validation library (zod or manual checks) before touching the DB.
- Add max-length constraints on all text inputs — both in form HTML (`maxLength`) and in API validation.
- Strip HTML tags from any user-supplied text that gets rendered (prevent XSS).

**API Hardening**
- Add rate limiting to: `/api/auth/login`, `/api/auth/signup`, `/api/proposals`, `/api/request-quote`. Return `429` on abuse.
- Add request body size limits to all API routes.
- Validate all URL parameters (IDs must be positive integers — reject strings, negative numbers, floats).
- Return generic error messages to the client. Do NOT leak stack traces, SQL errors, or internal paths in API `500` responses. Log full error server-side only.
- Add `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers via `next.config.js`.

**Secrets & Environment**
- Scan ALL files for hardcoded credentials, API keys, or passwords. If found, replace with `process.env.VAR_NAME` and add to `.env.local.example` (never `.env.local`).
- Ensure `.env.local` is in `.gitignore`. Check that `scripts/` directory is covered by a local `.gitignore` with `*.js`.

**Data Exposure**
- Ensure no API endpoint returns password hashes, internal IDs that shouldn't be public, or private user data that isn't needed by the calling client.
- On `/api/projects/open` and similar public endpoints, return only the fields the UI needs. Avoid `SELECT *`.

---

## DIMENSION 2 — VISUAL DESIGN

Make the design world-class and consistent across every single page:

**Hero Sections**
- Every page that has a hero must follow the same pattern: layered dark backgrounds, aurora animation via `auroraDrift` keyframe (already in `globals.css`), `#00C6FF` heading treatment using `hero-gradient-refined` CSS class, consistent height (min-h-[72vh] for main pages, min-h-[40vh] for secondary pages).
- The hero heading gradient must use `hero-gradient-refined` class (solid `#00C6FF` with drop-shadow), NOT an animated gradient. This matches the "Built by Experts." treatment.
- Every hero has: eyebrow text (small uppercase tracking label above headline), headline, subheadline, optional CTA buttons. Freelancer-facing pages hide client CTAs.

**Cards**
- All freelancer/project/product cards must use identical border treatment: `rounded-[20px] border border-white/12 bg-gradient-to-b from-[#101722] via-[#0c121d] to-[#060910] hover:-translate-y-1 hover:border-white/20 transition`
- Every card must have a consistent hover state — the `hover:-translate-y-1` lift + border brightening.
- No card should use a flat background without the gradient treatment.

**Typography**
- Establish and enforce a type scale across ALL pages: `text-[clamp(36px,5.5vw,68px)]` for h1, `text-3xl` for h2, `text-xl` for h3, `text-sm` for body.
- All heading font weights must be `font-extrabold` (800) for page titles, `font-semibold` (600) for section headings.
- Letter spacing: all h1 must have `tracking-[-0.03em]`. Eyebrow labels: `tracking-[0.4em] uppercase text-xs`.

**Color Consistency**
- The ONLY accent colors are: `cyan-400/500` (#00C6FF area) and `violet-400/500`. No random purple, blue, or teal values.
- All CTA buttons: gradient `from-cyan-500 via-fuchsia-500 to-rose-500` for primary, `border-white/15` for secondary.
- Muted text is always `text-white/70`, very muted is `text-white/50`, placeholder text `text-white/60`.

**Spacing & Layout**
- All page content containers: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- Consistent section vertical spacing: `py-16` for main sections, `py-10` for subsections.
- Section dividers: `border-t border-white/10` — never a hard `<hr>`.

**Missing Visual Polish (check every page)**
- Pages that are plain/unstyled (e.g., `/about`, `/contact`, `/careers`, `/blog`, `/terms`, `/privacy`, `/cookies`, `/how-it-works`) must be upgraded to use the full dark theme system — proper hero, cards where appropriate, consistent spacing.
- Empty states (no results, no data) must have an illustration/icon + helpful message + action CTA, never just "No data".
- Loading states: every data-fetching component needs a skeleton loader, not a blank white flash.

---

## DIMENSION 3 — UX & USABILITY

**Navigation & Flow**
- Add breadcrumbs to all deep pages (`/products/[id]`, `/freelancers/profile/[id]`). Already exists on products — extend to all.
- Back-navigation should always be available. Every detail page needs a `← Back to X` link at the top.
- Active nav item must be clearly highlighted in the header for the current page.
- The mobile menu must include ALL navigation items available on desktop — audit for any missing items.

**Forms**
- All forms need: proper `label` elements (not just placeholders), inline validation (show error before submit), loading state on submit button (spinner + disabled), success feedback (toast or inline message).
- Password fields need a show/hide toggle.
- Email fields must validate format client-side.
- Required fields must be marked with a visual indicator.
- All forms must be keyboard-navigable (Tab order, Enter to submit).

**Feedback & Notifications**
- Implement a global toast/notification system if one doesn't exist. Every user action (save, submit, delete, error) must produce visible feedback.
- API errors must show user-friendly messages — never raw error strings or "Something went wrong" with no context.

**Role-Based UX Clarity**
- When a freelancer visits a page and some content is hidden from them, add a subtle context indicator so they understand they're in a "freelancer view" — e.g., a small banner or status chip in the header showing role.
- If a freelancer tries to access a client-only page by URL, redirect to their dashboard with a message, not a blank/broken page.
- Unverified freelancers trying to apply to projects: show a clear "Verify your account to apply" message with a link to the verification page — not just a disabled button with no explanation.

**Search & Filtering**
- Search inputs on `/freelancers`, `/open-projects`, and `/products` must:
  - Have proper placeholder text (white/60 color via `search-input-field` class — already exists in globals.css, apply it everywhere)
  - Show a result count ("7 projects found")
  - Handle empty results gracefully with a helpful message
  - Clear button (×) when a filter is active

**Accessibility**
- All images must have descriptive `alt` attributes — never empty alt on meaningful images.
- All interactive elements must have `aria-label` or visible text.
- Focus rings must be visible on all interactive elements — use `focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70`.
- Color contrast: all text on dark backgrounds must meet WCAG AA (4.5:1 ratio minimum). Audit `text-white/50` and below — use `/60` minimum for body text.
- Semantic HTML: use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` correctly throughout.

---

## DIMENSION 4 — PERFORMANCE

**Data Fetching**
- Implement proper loading states for all client-side fetches.
- Add `stale-while-revalidate` caching headers to public API endpoints (`/api/projects/open`, `/api/products`).
- Paginate any list that could return more than 20 results — `/freelancers`, `/open-projects`, `/products` must have pagination or infinite scroll.
- Use `getStaticProps` with revalidation for content that rarely changes (homepage, how-it-works, etc.).

**Images**
- Replace all `<img>` tags with Next.js `<Image>` component (`next/image`) for automatic optimization, lazy loading, and WebP conversion.
- Add `width`, `height`, and `priority` props correctly on above-the-fold images.

**Bundle**
- Audit imports — do not import entire libraries when only one function is needed (e.g., `import { X } from 'lucide-react'` not `import * as Icons`).
- Move large, non-critical components to dynamic imports with `next/dynamic`.

---

## DIMENSION 5 — CODE QUALITY

**TypeScript**
- Zero `any` types anywhere in the codebase. Replace all `any` with proper typed interfaces.
- All API response types must be defined in `src/types/` and shared between frontend and API routes.
- All component props must have explicit TypeScript interfaces.

**Consistency**
- All API routes must follow the same pattern: method check → auth check → input validation → DB query → return typed response.
- All pages must follow the same pattern: imports → interfaces → constants → component → getServerSideProps/getStaticProps.
- All components in `src/components/` must have a default export and a named TypeScript interface for props.

**Error Handling**
- Every `try/catch` block in API routes must: log the error server-side with `console.error`, return a proper HTTP status code, return a JSON response with an `error` field.
- Never swallow errors silently (empty catch blocks).

**Database**
- All DB queries must have a reasonable timeout/limit to prevent runaway queries.
- Use `LIMIT` on all `SELECT` queries that could return unbounded results.
- Check all foreign key constraints are properly set in MySQL schemas.

---

## DIMENSION 6 — MOBILE RESPONSIVENESS

Audit every single page at 375px (iPhone SE), 768px (tablet), and 1280px (desktop):

- No horizontal scroll at any breakpoint.
- All navigation collapses properly to mobile menu.
- All card grids collapse from 3-col → 2-col → 1-col at appropriate breakpoints.
- All buttons and tap targets are minimum 44×44px.
- Hero sections scale correctly — no text overflow, no cramped spacing.
- Tables are scrollable or collapsed to card layout on mobile.
- Modals/overlays must be full-screen or near-full-screen on mobile.
- The apply modal on `/open-projects` must be usable on a phone.

---

## DIMENSION 7 — SEO & META

For every page:
- Unique `<title>` tag: format `{Page Name} - Unitiv` (max 60 chars).
- Unique `<meta name="description">` (150-160 chars, includes key phrase).
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- Twitter Card tags.
- Canonical URL tag.
- `<h1>` must be the most important keyword phrase for that page — exactly ONE `<h1>` per page.
- Internal linking: every page should link to at least 2-3 other relevant pages.
- Add `robots.txt` if missing. Add `sitemap.xml` generation.
- `alt` text on all images should describe the content, not just say "image".

---

## DIMENSION 8 — SPECIFIC PAGE CHECKLIST

Go through EVERY page in the `pages/` directory and apply all dimensions above. For each page, explicitly check:

**Homepage (`/`)**
- Hero has aurora animation, correct heading treatment, role-based CTAs
- All sections use consistent spacing and card styles
- No client-facing CTAs visible to logged-in freelancers
- Stats section has proper empty state if data is unavailable

**Freelancers (`/freelancers`)**
- Search input uses `search-input-field` class
- "Didn't find the perfect match?" section hidden from freelancers (already done — verify)
- "Request Proposal" and "Ask for samples" hidden from freelancers (already done — verify)
- Cards use `rounded-[20px] border border-white/12` style (already done — verify)
- Profile links work and open `/freelancers/profile/[id]`

**Open Projects (`/open-projects`)**
- Hero matches Freelancers page (already done — verify)
- Budget hidden from all (already done — verify)
- Apply modal works end-to-end for logged-in verified freelancers
- Unverified freelancers see "Verify account to apply" message
- Non-freelancers see "Post a Project" CTA

**Products (`/products`)**
- All hero CTAs hidden from freelancers (already done — verify)
- Card buttons ("Request Proposal", "View Scope") hidden from freelancers (already done — verify)
- Category filter chips work correctly

**Product Detail (`/products/[id]`)**
- "Request custom quote" and pricing sidebar hidden from freelancers (already done — verify)
- Hero and scope sections visible to everyone
- Back link works

**Freelancer Profile (`/freelancers/profile/[id]`)**
- Check what freelancers can see vs clients
- "Request Proposal" / "Ask for samples" hidden from freelancers
- Contact button behavior: clients → modal, freelancers → no button or "View profile"

**Login & Signup (`/login`, `/signup`)**
- Forms have proper validation and error messages
- Redirects correctly by role after login
- Forgot password link works

**Dashboard pages** (`/dashboard`, `/freelancers/dashboard`, `/clients/dashboard`)
- Role-gated: freelancers can't access client dashboard and vice versa
- Meaningful empty states when no data exists
- All data comes from real DB, no mock data

**Admin pages** (`/admin`, `/admin/*`)
- All admin routes verify `canAccessAdminDashboard()` server-side
- No sensitive operations possible via client-only auth checks

**Static/content pages** (`/about`, `/contact`, `/how-it-works`, `/apply`, `/careers`, `/blog`)
- Styled consistently with the design system
- No broken or empty pages
- Contact form submits and gives feedback

**Legal pages** (`/terms`, `/privacy`, `/cookies`, `/protection`)
- Styled minimally but on-brand
- Readable typography
- Last-updated date shown

---

## EXECUTION RULES

1. **Never delete or break an existing page.** If a page needs redesigning, redesign it in place.
2. **Test every change** — if you modify an API route, re-read the consuming component to confirm it still works.
3. **Keep role-based logic consistent** — always use `const viewerIsFreelancer = isFreelancer()` from `useAuth()`. Never invent new auth patterns.
4. **One change at a time** — read the file, understand its current state, make targeted edits, verify the JSX is valid before moving on.
5. **Escape JSX text correctly** — `&apos;` for apostrophes in JSX text nodes, `&amp;` for ampersands. Use double-quoted strings when the string contains a single quote.
6. **No hardcoded credentials** — all DB/API credentials in `process.env` only.
7. **Prioritize in this order**: Security → Broken UX → Visual inconsistency → Performance → Code quality.
8. **Report what you changed** — at the end of each file edit, output a one-line summary of what changed and why.

---

## START COMMAND

Begin by running a full audit. For each page/component in `pages/` and `src/components/`:
1. Read the file
2. List every issue found across all 8 dimensions
3. Prioritize by impact (Security first, then UX, then visual)
4. Fix the highest-impact issues first
5. Move to the next file

Start with the most critical files: auth API routes → public-facing pages → dashboard pages → admin pages → static pages.

Ask me if you need clarification on any business logic before making a change that could affect user flows.
