# Freelancer Showcase Setup Guide

## Quick Start

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Schema**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/supabase-schema.sql`
   - Execute the SQL script

3. **Set Up Storage**
   - The schema automatically creates a `portfolio-images` bucket
   - Configure storage policies as needed

### 2. Environment Configuration

1. **Copy Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 3. Install Dependencies

```bash
cd digital-dropshipping-site
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## File Integration

To integrate the freelancer showcase into your main Next.js app:

### 1. Copy Files to Main Project

```bash
# Copy API routes
cp -r freelancer-showcase/api/* src/pages/api/

# Copy pages
cp freelancer-showcase/pages/*.tsx src/pages/
cp -r freelancer-showcase/pages/freelancer src/pages/

# Copy types (merge with existing)
# Manually add the freelancer types to src/types/index.ts

# Copy Supabase config
cp freelancer-showcase/lib/supabase.ts src/lib/
```

### 2. Update Main Package.json

The dependencies are already added to your main `package.json`.

### 3. Update Navigation

Add links to your main navigation:
- `/freelancers` - Freelancer showcase
- `/apply` - Apply as freelancer
- `/admin` - Admin dashboard (protect with auth)

## Database Connection

Your Supabase connection details:
- **Host**: db.ptsvsfwkxuxzwsgvqecc.supabase.co
- **Port**: 5432
- **Database**: postgres
- **User**: postgres
- **Password**: [Your password from Supabase dashboard]

## Security Notes

1. **Admin Authentication**: The admin dashboard currently has no authentication. Implement proper admin auth before production.

2. **Environment Variables**: Never commit `.env.local` to version control.

3. **Service Role Key**: Keep the service role key secure and only use server-side.

## Testing

1. **Test Freelancer Application**
   - Visit `/apply`
   - Submit a test application
   - Check admin dashboard at `/admin`

2. **Test Public Showcase**
   - Approve a freelancer in admin
   - Visit `/freelancers` to see the public listing
   - Test individual freelancer profiles

3. **Test Quote Requests**
   - Visit a freelancer profile
   - Submit a quote request
   - Check that the request is processed

## Production Deployment

1. **Set up production Supabase project**
2. **Update environment variables for production**
3. **Implement proper admin authentication**
4. **Set up email notifications**
5. **Configure domain and SSL**

## Support

For issues or questions:
1. Check the main README.md
2. Review the database schema
3. Verify environment variables
4. Check browser console for errors
