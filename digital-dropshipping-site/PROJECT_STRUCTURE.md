# Project Structure Guide

This document explains the organization of all files in the Unitiv project.

## 📁 Directory Structure

### Root Level
```
digital-dropshipping-site/
├── 📄 Configuration Files
│   ├── package.json          # Dependencies & scripts
│   ├── tsconfig.json         # TypeScript config
│   ├── next.config.js        # Next.js config
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── postcss.config.js     # PostCSS config
│   ├── playwright.config.ts  # E2E test config
│   ├── lighthouserc.json     # Lighthouse CI config
│   ├── .prettierrc.json      # Code formatting rules
│   ├── .gitignore           # Git ignore rules
│   └── env.example          # Environment variables template
│
├── 📚 Documentation (docs/)
│   ├── README.md            # Documentation index
│   ├── SETUP.md             # Development setup
│   ├── QUICK_DEPLOY.md      # Quick deployment guide
│   ├── DEPLOYMENT.md        # Full deployment guide
│   └── AUTOMATION_SETUP.md  # CI/CD automation
│
├── 🔧 Scripts (scripts/)
│   ├── setup-admin.js       # Create admin user
│   ├── hash-password.js     # Password hashing utility
│   └── check-admin-users.js # Admin user checker
│
├── 🎨 Public Assets (public/)
│   ├── images/              # All images
│   │   ├── logo/            # Logo files
│   │   └── products/       # Product images
│   ├── Video/               # Video files (meeting.mp4)
│   └── uploads/             # User-generated uploads
│
├── 📄 Pages (pages/)
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin APIs
│   │   ├── auth/           # Authentication APIs
│   │   ├── freelancers/    # Freelancer APIs
│   │   └── [other APIs]    # Other endpoints
│   ├── admin/              # Admin dashboard pages
│   ├── freelancers/        # Freelancer pages
│   └── [public pages]      # About, Contact, Terms, etc.
│
├── 💻 Source Code (src/)
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   └── [shared]        # Shared components
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts     # Supabase client
│   │   ├── supabase-admin.ts # Admin Supabase client
│   │   ├── api.ts          # API utilities
│   │   ├── auth.ts        # Auth utilities
│   │   └── permissions.ts # Permission checks
│   ├── hooks/               # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── services/           # External service integrations
│   ├── styles/             # Global CSS
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
│
├── 🗄️ Database (supabase/)
│   ├── 00-complete-setup.sql
│   ├── 001-security-errors.sql
│   ├── create-events-table.sql
│   ├── freelancer-dashboard-schema.sql
│   └── [other SQL files]
│
├── 🧪 Tests (tests/)
│   ├── e2e/                # End-to-end tests
│   └── unit/               # Unit tests
│
└── 🤖 Automation (.github/)
    └── workflows/          # GitHub Actions workflows
        ├── ci.yml          # Continuous Integration
        ├── db-migrate.yml  # Database migrations
        ├── release.yml     # Semantic versioning
        ├── backup.yml     # Database backups
        └── lighthouse.yml # Performance testing
```

## 📝 File Organization Rules

### Where to Put New Files

**New Component?**
→ `src/components/[category]/ComponentName.tsx`

**New API Route?**
→ `pages/api/[category]/route-name.ts`

**New Page?**
→ `pages/page-name.tsx` (or `pages/[category]/page-name.tsx`)

**New Utility Function?**
→ `src/utils/utility-name.ts`

**New Type Definition?**
→ `src/types/index.ts` (add to existing file)

**New Database Migration?**
→ `supabase/migrations/YYYYMMDDHHMMSS_migration-name.sql`

**New Test?**
→ `tests/unit/` or `tests/e2e/`

**New Documentation?**
→ `docs/` folder

## 🔗 Import Path Rules

### From `pages/` to `src/`:
```typescript
import Header from '../src/components/Header'
import { supabase } from '../src/lib/supabase'
```

### From `src/components/` to `src/lib/`:
```typescript
import { supabase } from '../lib/supabase'
```

### From `pages/api/` to `src/lib/`:
```typescript
import { supabase } from '../../src/lib/supabase'
```

### Public Assets:
```typescript
// Always use / prefix (relative to public folder)
<img src="/images/logo/logo.png" />
<video src="/Video/meeting.mp4" />
```

## ✅ Best Practices

1. **Keep pages/ folder for Next.js routes only**
2. **Put reusable components in src/components/**
3. **Keep API logic in src/lib/**
4. **Organize SQL files in supabase/**
5. **Documentation goes in docs/**
6. **Tests go in tests/ with matching structure**

## 🚫 Don't Put Files Here

- ❌ Root level (except config files)
- ❌ Random folders at root
- ❌ Duplicate nested folders
- ❌ Files outside their category

## 🔍 Finding Files

**Looking for a component?** → `src/components/`
**Looking for an API?** → `pages/api/`
**Looking for a page?** → `pages/`
**Looking for styles?** → `src/styles/`
**Looking for types?** → `src/types/`
**Looking for SQL?** → `supabase/`

