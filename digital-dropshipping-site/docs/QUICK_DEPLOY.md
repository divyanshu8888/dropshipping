# 🚀 Quick Deploy Guide - Get Your Site Live in 10 Minutes

## Option 1: Vercel (Easiest - Recommended)

Vercel is made by the creators of Next.js, so it works perfectly.

### Step-by-Step:

1. **Push Your Code to GitHub**
   ```bash
   # If you haven't already
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create repo on GitHub.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/uniti.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with your GitHub account (free)

3. **Import Your Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's Next.js ✅

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_URL=https://your-site.vercel.app
   NEXTAUTH_SECRET=generate_random_string_here
   NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
   ```
   
   **Get Supabase Keys:**
   - Go to your Supabase project
   - Settings → API
   - Copy "Project URL" and "anon public" key
   - Copy "service_role" key (keep secret!)

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://your-project.vercel.app`

6. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `uniti.com`)
   - Follow DNS instructions
   - SSL certificate is automatic! 🔒

---

## Option 2: Netlify (Alternative)

Similar to Vercel:

1. Go to https://netlify.com
2. Sign up with GitHub
3. "New site from Git"
4. Select your repo
5. Build settings:
   - Build command: `cd digital-dropshipping-site && npm run build`
   - Publish directory: `digital-dropshipping-site/.next`
6. Add environment variables
7. Deploy!

---

## Option 3: Your Own Server (Advanced)

If you have a VPS/server:

```bash
# On your server
git clone https://github.com/YOUR_USERNAME/uniti.git
cd uniti/digital-dropshipping-site
npm install
npm run build
npm start

# Use PM2 to keep it running
npm install -g pm2
pm2 start npm --name "uniti" -- start
pm2 save
pm2 startup
```

Then configure Nginx as a reverse proxy.

---

## What Happens Automatically with Vercel:

✅ **Every time you push code:**
- Vercel automatically builds and deploys
- New changes go live in 2-3 minutes
- You get a preview URL for every PR
- Rollback is one click away

✅ **Free Tier Includes:**
- Unlimited personal projects
- 100GB bandwidth/month
- Automatic SSL certificates
- Global CDN (fast worldwide)
- Preview deployments for PRs

---

## Quick Checklist:

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Site loads at vercel.app URL
- [ ] (Optional) Custom domain configured

---

## Need Help?

**Deployment Fails?**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure `package.json` has correct scripts

**Site Loads But Shows Errors?**
- Check browser console for errors
- Verify Supabase connection
- Check environment variables match production Supabase project

**Database Issues?**
- Make sure Supabase project is active
- Check RLS (Row Level Security) policies
- Verify connection strings

---

**🎉 That's it! Your site will be live and accessible to everyone!**

