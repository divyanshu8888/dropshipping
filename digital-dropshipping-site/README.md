# Uniti Platform

A comprehensive e-commerce platform with integrated freelancer showcase system.

## Features

### E-commerce Platform
- Product catalog and management
- Shopping cart functionality
- Order processing
- Stripe payment integration
- Dropshipping provider integration

### Freelancer Showcase System
- Secure freelancer onboarding
- Privacy-protected portfolio display
- Admin dashboard for management
- Client quote request system
- Row-level security with Supabase

## Project Structure

```
digital-dropshipping-site/
├── .github/
│   └── workflows/          # CI/CD automation (GitHub Actions)
├── docs/                   # 📚 Documentation
│   ├── README.md          # Documentation index
│   ├── SETUP.md          # Development setup guide
│   ├── QUICK_DEPLOY.md   # Quick deployment guide
│   ├── DEPLOYMENT.md     # Complete deployment guide
│   └── AUTOMATION_SETUP.md # CI/CD automation guide
├── public/                 # Static assets
│   ├── images/            # Images and logos
│   ├── Video/             # Video files
│   └── uploads/           # User uploads
├── pages/                  # Next.js pages & API routes
│   ├── api/               # API endpoints
│   ├── admin/             # Admin pages
│   ├── freelancers/       # Freelancer pages
│   └── [other pages]      # Public pages
├── src/                    # Source code
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API clients
│   ├── contexts/          # React contexts
│   ├── services/          # External service integrations
│   ├── styles/            # Global CSS
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── supabase/              # Database migrations & SQL
│   ├── migrations/        # Database migrations (auto-applied)
│   └── *.sql              # SQL setup scripts
├── scripts/               # Utility scripts
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests (Playwright)
│   └── unit/             # Unit tests (Jest)
├── .github/               # GitHub configuration
├── .husky/                # Git hooks (pre-commit)
├── Configuration files:   # Root level configs
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── playwright.config.ts
│   ├── lighthouserc.json
│   └── .prettierrc.json
└── Documentation:         # Root level docs
    └── README.md          # This file
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Setup Husky for pre-commit hooks
npm run prepare

# Start development server
npm run dev
```

## 📚 Documentation

All documentation is now organized in the `docs/` folder:

- **[docs/SETUP.md](docs/SETUP.md)** - Complete development setup
- **[docs/QUICK_DEPLOY.md](docs/QUICK_DEPLOY.md)** - Deploy in 10 minutes
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Full deployment guide
- **[docs/AUTOMATION_SETUP.md](docs/AUTOMATION_SETUP.md)** - CI/CD automation
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File structure guide

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env.local` and fill in your actual values:

```env
# Database (Supabase)

# Supabase (for freelancer showcase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

#### Database Setup (Supabase)
All database operations are handled through Supabase. No additional setup required.

#### Freelancer Showcase Database (Supabase)
1. Create a Supabase project
2. Run the SQL schema from `freelancer-showcase/database/supabase-schema.sql`
3. Configure your environment variables

### 4. Run Development Server
```bash
npm run dev
```

## Integration Guide

To integrate the freelancer showcase system into your main project, follow the instructions in `integrate-freelancer-showcase.md`.

## Available Routes

### E-commerce Routes
- `/` - Home page
- `/products` - Product catalog
- `/products/[id]` - Individual product page
- `/cart` - Shopping cart
- `/checkout` - Checkout process

### Freelancer Showcase Routes
- `/freelancers` - Public freelancer showcase
- `/freelancer/[id]` - Individual freelancer profile
- `/apply` - Freelancer application form
- `/admin` - Admin dashboard (protect with authentication)

### API Routes
- `/api/products` - Product management
- `/api/orders` - Order processing
- `/api/freelancers/*` - Freelancer management
- `/api/admin/*` - Admin operations
- `/api/quote-request` - Client quote requests

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **Deployment**: Vercel (recommended)

## Security Features

- Row-level security (RLS) for freelancer data
- Input validation and sanitization
- Secure API routes with proper authentication
- Environment variable protection
- CSRF protection

## Development

### Running Tests
```bash
# Unit tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage

# E2E tests (Playwright)
npm run e2e

# E2E tests with UI
npm run e2e:ui
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck

# Format code (Prettier)
npx prettier --write .
```

### Building for Production
```bash
npm run build
npm start

# Analyze bundle size
npm run analyze
```

### Database Management
All database operations are handled through the Supabase dashboard or CLI:
```bash
# Push migrations
supabase db push

# Seed database
npm run db:seed
```

## CI/CD & Automation

This project includes comprehensive CI/CD automation:

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push/PR
   - Lints, type-checks, tests, and builds
   - Protects `main` branch (requires passing CI)

2. **Database Migrations** (`.github/workflows/db-migrate.yml`)
   - Auto-applies migrations on `dev` and `main`
   - Separate staging/production environments

3. **Semantic Release** (`.github/workflows/release.yml`)
   - Auto-versioning based on commit messages
   - Generates CHANGELOG.md
   - Creates GitHub releases
   - Uses [Conventional Commits](https://www.conventionalcommits.org/)

4. **Nightly Backups** (`.github/workflows/backup.yml`)
   - Daily database backups at 2 AM UTC
   - 30-day retention in GitHub artifacts

5. **Lighthouse CI** (`.github/workflows/lighthouse.yml`)
   - Performance, accessibility, SEO checks
   - Fails PRs if scores drop below 90

### Pre-commit Hooks

Husky + lint-staged automatically:
- Lints and fixes code
- Formats with Prettier
- Prevents bad commits

### Required GitHub Secrets

Add these in your GitHub repository settings:

**CI/CD:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

**Database Migrations:**
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI access token
- `SUPABASE_PROJECT_REF` - Production project reference
- `SUPABASE_STAGING_PROJECT_REF` - Staging project reference (optional)

**Backups:**
- `SUPABASE_DB_URL` - Full PostgreSQL connection string (service role)

**Releases:**
- `GITHUB_TOKEN` - Auto-generated
- `NPM_TOKEN` - For publishing (if needed)

**Lighthouse:**
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI token (optional)

### Deployment

#### Vercel (Recommended)

1. **Connect Repository:**
   - Import your GitHub repo to Vercel
   - Vercel auto-detects Next.js

2. **Environment Variables:**
   - Add all variables from `env.example`
   - Set separately for Preview/Production

3. **Automatic Deployments:**
   - Every push to `main` → Production
   - Every PR → Preview deployment
   - Merge to `dev` → Staging environment

4. **Branch Protection:**
   - Enable "Require status checks" in GitHub
   - Add "CI" workflow as required check

#### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) for auto-versioning:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance tasks

# Examples:
feat: add newsletter subscription
fix: correct footer link routing
docs: update deployment guide
```

### Monitoring & Alerts

**Recommended:**
- **Sentry** - Error tracking (frontend + API)
- **Vercel Analytics** - Performance monitoring
- **UptimeRobot** - Uptime monitoring (ping every minute)

### Content Automation

- Newsletter → Resend/Mailgun integration
- ISR/Revalidation for dynamic content
- Vercel Cron for scheduled tasks

## Support

For questions or issues:
1. Check the relevant documentation
2. Review the integration guide
3. Check environment variables
4. Verify database connections

## License

MIT License - see LICENSE file for details.