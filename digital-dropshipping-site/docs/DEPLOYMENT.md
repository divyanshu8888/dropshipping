# Deployment Guide

Complete guide for deploying Unitiv to production.

## Prerequisites

- GitHub repository (public or private)
- Supabase project (production)
- Vercel account (or alternative)
- Domain name (optional)

## Step-by-Step Deployment

### 1. GitHub Repository Setup

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/uniti.git
   git branch -M main
   git push -u origin main
   ```
3. Create `dev` branch:
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```

### 2. Vercel Setup

1. **Import Project:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js settings

2. **Configure Project:**
   - Root Directory: `digital-dropshipping-site`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)

3. **Environment Variables:**
   Add all variables from `env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only for API routes)
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXTAUTH_URL` (production URL)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`

4. **Branch Settings:**
   - Production Branch: `main`
   - Preview Branches: All branches
   - Enable automatic deployments

### 3. GitHub Secrets Setup

Go to **Settings → Secrets and variables → Actions**:

**Required Secrets:**
```
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_ACCESS_TOKEN=your_supabase_cli_token
SUPABASE_PROJECT_REF=your_production_project_ref
SUPABASE_STAGING_PROJECT_REF=your_staging_project_ref (optional)
SUPABASE_DB_URL=postgresql://postgres:password@host:5432/dbname
```

**Get Supabase Access Token:**
1. Go to Supabase Dashboard
2. Account Settings → Access Tokens
3. Generate new token

**Get Project Reference:**
- Found in Supabase project URL: `https://[project-ref].supabase.co`

### 4. Database Setup

**Production Database:**
1. Create production Supabase project
2. Run migrations:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
3. Seed initial data if needed:
   ```bash
   npm run db:seed
   ```

**Staging Database (Optional):**
1. Create separate Supabase project for staging
2. Use same migration process
3. Configure in `.github/workflows/db-migrate.yml`

### 5. Branch Protection

1. Go to GitHub → Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require CI workflow to pass
   - ✅ Require branches to be up to date

### 6. Domain Setup (Optional)

1. In Vercel project settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificates auto-provision

### 7. Monitoring Setup

**Sentry (Error Tracking):**
1. Create Sentry account
2. Install `@sentry/nextjs`:
   ```bash
   npm install @sentry/nextjs
   ```
3. Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
4. Add `SENTRY_DSN` to environment variables

**Uptime Monitoring:**
1. Sign up for UptimeRobot or Better Uptime
2. Add monitor for production URL
3. Set 1-minute interval
4. Configure alerts (email/Slack)

### 8. First Deployment

```bash
# Make a test change
git checkout -b test-deployment
git add .
git commit -m "chore: initial deployment"
git push origin test-deployment

# Create PR to main
# CI will run automatically
# Vercel will create preview deployment
```

## Post-Deployment Checklist

- [ ] Verify production URL loads correctly
- [ ] Test authentication flows
- [ ] Test database connections
- [ ] Verify API routes work
- [ ] Check environment variables
- [ ] Test Stripe payments (test mode)
- [ ] Verify email notifications
- [ ] Set up monitoring alerts
- [ ] Configure backups
- [ ] Update DNS if using custom domain

## Troubleshooting

**Build Failures:**
- Check environment variables in Vercel
- Review GitHub Actions logs
- Verify TypeScript errors: `npm run typecheck`

**Database Issues:**
- Verify Supabase project is active
- Check RLS policies
- Review connection strings

**Deployment Errors:**
- Check Vercel build logs
- Verify Node.js version (should be 20)
- Ensure all dependencies are in `package.json`

## Rollback Procedure

**Vercel:**
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "⋯" → "Promote to Production"

**Database:**
```bash
# Revert specific migration
supabase migration repair --version TIMESTAMP

# Or restore from backup
pg_restore -d DATABASE backup_file.sql
```

## Performance Optimization

- Enable Vercel Analytics
- Use ISR for static content
- Optimize images with Next.js Image
- Enable compression
- Use CDN for static assets

## Security Checklist

- [ ] All secrets in environment variables
- [ ] RLS enabled on Supabase tables
- [ ] API routes properly authenticated
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured correctly
- [ ] Input validation on all forms
- [ ] Rate limiting on API routes
- [ ] Security headers configured

