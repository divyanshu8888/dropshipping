# File Organization Guide

This document explains how files are organized and where to place new files.

## ✅ Current Organization

### 📁 Root Directory
Only configuration files and main documentation should be in root:
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `tailwind.config.js` - Tailwind CSS config
- `.gitignore` - Git ignore rules
- `README.md` - Main project documentation
- `PROJECT_STRUCTURE.md` - Structure overview

### 📚 Documentation (`docs/`)
All guides and documentation:
- `README.md` - Documentation index
- `SETUP.md` - Development setup
- `QUICK_DEPLOY.md` - Quick deployment
- `DEPLOYMENT.md` - Full deployment guide
- `AUTOMATION_SETUP.md` - CI/CD automation
- `FILE_ORGANIZATION.md` - This file

### 💻 Source Code (`src/`)
All application code:
```
src/
├── components/     # React components
├── lib/            # Utilities & API clients
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── services/       # External services
├── styles/         # CSS files
├── types/          # TypeScript types
└── utils/          # Helper functions
```

### 📄 Pages (`pages/`)
Next.js pages and API routes:
```
pages/
├── api/            # API endpoints
│   ├── admin/     # Admin APIs
│   ├── auth/      # Auth APIs
│   └── ...
├── admin/          # Admin pages
├── freelancers/    # Freelancer pages
└── [public].tsx    # Public pages
```

### 🗄️ Database (`supabase/`)
All SQL and database files:
- `00-complete-setup.sql` - Main schema
- `001-security-errors.sql` - Security fixes
- `migrations/` - Auto-applied migrations
- `*.sql` - Other SQL scripts

### 🎨 Public Assets (`public/`)
Static files served directly:
```
public/
├── images/         # All images
├── Video/          # Video files
└── uploads/        # User uploads
```

### 🔧 Scripts (`scripts/`)
Utility scripts:
- `setup-admin.js` - Admin user creation
- `hash-password.js` - Password hashing
- `check-admin-users.js` - Admin checker

### 🧪 Tests (`tests/`)
Test files:
```
tests/
├── e2e/            # End-to-end tests
└── unit/           # Unit tests
```

## 📍 Import Path Guidelines

### From `pages/` to `src/`:
```typescript
// ✅ Correct
import Header from '../src/components/Header'
import { supabase } from '../src/lib/supabase'

// ❌ Wrong
import Header from '@/components/Header'  // Not configured
```

### From `pages/api/` to `src/`:
```typescript
// ✅ Correct
import { supabase } from '../../src/lib/supabase'

// ❌ Wrong
import { supabase } from '../src/lib/supabase'  // Wrong relative path
```

### From within `src/`:
```typescript
// ✅ Correct
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
```

### Public Assets:
```typescript
// ✅ Always use / prefix (relative to public folder)
<img src="/images/logo/logo.png" />
<video src="/Video/meeting.mp4" />
```

## 🎯 Where to Put New Files

### New React Component?
→ `src/components/[category]/ComponentName.tsx`

### New API Route?
→ `pages/api/[category]/route-name.ts`

### New Page?
→ `pages/page-name.tsx` or `pages/[category]/page-name.tsx`

### New Utility Function?
→ `src/utils/utility-name.ts`

### New Type Definition?
→ `src/types/index.ts` (add to existing file)

### New Database Migration?
→ `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

### New Test?
→ `tests/unit/` or `tests/e2e/`

### New Documentation?
→ `docs/` folder

### New Script?
→ `scripts/script-name.js`

## ❌ Common Mistakes to Avoid

1. **Don't create nested project folders**
   - ❌ `digital-dropshipping-site/digital-dropshipping-site/`
   - ✅ Use root directly

2. **Don't put documentation in root**
   - ❌ `SETUP.md` in root
   - ✅ `docs/SETUP.md`

3. **Don't scatter SQL files**
   - ❌ SQL files in root
   - ✅ All in `supabase/`

4. **Don't use absolute imports without config**
   - ❌ `import from '@/components'`
   - ✅ `import from '../src/components'`

5. **Don't put config files in wrong places**
   - ❌ `tsconfig.json` in `src/`
   - ✅ `tsconfig.json` in root

## 🔍 Finding Files

**Component?** → `src/components/`
**API Route?** → `pages/api/`
**Page?** → `pages/`
**Styles?** → `src/styles/`
**Types?** → `src/types/`
**SQL?** → `supabase/`
**Documentation?** → `docs/`
**Tests?** → `tests/`

## 📋 File Naming Conventions

- **Components:** PascalCase (`Header.tsx`, `ProductCard.tsx`)
- **Pages:** kebab-case (`about.tsx`, `product-page.tsx`)
- **Utilities:** camelCase (`imageUtils.ts`, `formatDate.ts`)
- **Tests:** `*.test.ts` or `*.spec.ts`
- **Config:** `*.config.js` or `.rc.json`

