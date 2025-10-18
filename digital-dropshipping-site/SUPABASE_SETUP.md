# 🚀 Supabase Setup Guide for TalentHub Pro

## Step 1: Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one if you haven't)
3. Go to **Settings** → **API**
4. Copy these keys:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (even longer string, also starting with `eyJ...`)

## Step 2: Update `.env.local`

Open the file `digital-dropshipping-site/.env.local` and update with your keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ptsvsfwkxuxzwsgvqecc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=talenthub-pro-secret-key-2025

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents from `supabase/schema.sql`
4. Paste and click **Run**
5. Wait for it to complete (should see "Success" message)

This will create:
- ✅ All tables (freelancers, reviews, testimonials, etc.)
- ✅ Sample data (6 freelancers, reviews, testimonials)
- ✅ Row-level security policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updating ratings

## Step 4: Restart Dev Server

```bash
npm run dev
```

## Step 5: Verify It Works

1. Go to http://localhost:3000
2. You should see:
   - Dynamic testimonials from database
   - Real stats (6 freelancers, etc.)
   - No errors!

## 🎉 You're Done!

Your TalentHub Pro platform is now fully connected to Supabase with:
- ✅ Dynamic data from database
- ✅ Real reviews and testimonials
- ✅ Secure row-level security
- ✅ Ready for production!

## Need Help?

If you see errors:
1. Double-check your Supabase keys in `.env.local`
2. Make sure you ran the SQL schema
3. Restart the dev server
4. Clear your browser cache and refresh
