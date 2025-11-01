# Complete Setup Guide

Follow these steps to get your development environment ready.

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- Git
- Supabase account
- (Optional) Stripe account for payments

## Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/uniti.git
cd uniti/digital-dropshipping-site

# Install dependencies
npm install
```

## Step 2: Environment Configuration

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your preferred editor
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase project settings (keep secret!)

**Optional (for full functionality):**
- Stripe keys (for payments)
- NextAuth secret (for authentication)
- Email service keys

## Step 3: Database Setup

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema migrations
supabase db push
```

### Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the schema files from `supabase/` directory:
   - `00-complete-setup.sql`
   - `001-security-errors.sql`
   - `freelancer-dashboard-schema.sql`

## Step 4: Setup Pre-commit Hooks

```bash
# Initialize Husky
npm run prepare

# Verify hook is set up
ls -la .husky/pre-commit
```

This ensures code is automatically linted and formatted before commits.

## Step 5: Initial Admin User

```bash
# Create admin user in database
npm run setup:admin

# Follow prompts to create your admin account
```

## Step 6: Seed Database (Optional)

```bash
# Add sample products
npm run db:seed
```

## Step 7: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 8: Verify Setup

✅ **Checklist:**

- [ ] Server starts without errors
- [ ] Can access homepage
- [ ] Can log in (create test user)
- [ ] Database queries work
- [ ] No console errors

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

**Database connection errors:**
- Verify Supabase project is active
- Check environment variables
- Ensure RLS policies are set up

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

1. **Connect to Vercel:**
   - Import your repo
   - Configure environment variables
   - Enable automatic deployments

2. **Set up CI/CD:**
   - Add GitHub Secrets (see README)
   - Protect `main` branch
   - Configure branch rules

3. **Configure Monitoring:**
   - Set up Sentry
   - Configure uptime monitoring
   - Enable Vercel Analytics

## Development Workflow

1. Create feature branch: `git checkout -b feat/new-feature`
2. Make changes
3. Pre-commit hooks run automatically (lint + format)
4. Commit: `git commit -m "feat: add new feature"`
5. Push: `git push origin feat/new-feature`
6. Create PR → CI runs → Review → Merge

## Need Help?

- Check `README.md` for detailed docs
- Review `DEPLOYMENT.md` for production setup
- Check GitHub Issues for known problems

