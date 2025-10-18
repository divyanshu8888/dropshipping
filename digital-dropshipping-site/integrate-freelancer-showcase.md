# Integrate Freelancer Showcase into Main Project

## Integration Steps

### 1. Copy API Routes
```bash
# Copy all API routes to main project
cp -r freelancer-showcase/api/* src/pages/api/
```

### 2. Copy Pages
```bash
# Copy all pages to main project
cp freelancer-showcase/pages/*.tsx src/pages/
cp -r freelancer-showcase/pages/freelancer src/pages/
```

### 3. Update Types
Add the freelancer types to your existing `src/types/index.ts`:

```typescript
// Add these interfaces to your existing types file
export interface Freelancer {
    id: string;
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    base_fee?: number;
    contact_email?: string;
    contact_phone?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at?: string;
}

export interface FreelancerPublic {
    id: string;
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    status: 'approved';
    created_at: string;
}

export interface PortfolioItem {
    id: string;
    freelancer_id: string;
    title: string;
    summary: string;
    thumbnail_url?: string;
    gallery_urls: string[];
    tags: string[];
    is_public: boolean;
    created_at: string;
    updated_at?: string;
}

export interface PortfolioItemPublic {
    id: string;
    freelancer_id: string;
    title: string;
    summary: string;
    thumbnail_url?: string;
    gallery_urls: string[];
    tags: string[];
    created_at: string;
    is_public: true;
}

export interface FreelancerOnboardingData {
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    base_fee: number;
    contact_email: string;
    contact_phone?: string;
}

export interface Admin {
    user_id: string;
    role: string;
    created_at: string;
}

export interface QuoteRequest {
    name: string;
    email: string;
    company?: string;
    project_type: string;
    budget_range: string;
    timeline: string;
    description: string;
    preferred_skills?: string[];
}
```

### 4. Set Up Environment Variables
Create `.env.local` in your main project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ptsvsfwkxuxzwsgvqecc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Set Up Database
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `freelancer-showcase/database/supabase-schema.sql`
4. Execute the SQL script

### 6. Update Navigation
Add these links to your main navigation component:

```tsx
// Add to your Header component or navigation
<Link href="/freelancers">Freelancers</Link>
<Link href="/apply">Apply as Freelancer</Link>
<Link href="/admin">Admin</Link> // Protect this with authentication
```

### 7. Test the Integration
1. Start your development server: `npm run dev`
2. Visit `/apply` to test freelancer application
3. Visit `/admin` to test admin dashboard
4. Visit `/freelancers` to test public showcase

## File Structure After Integration

```
src/
├── pages/
│   ├── api/
│   │   ├── freelancers/
│   │   │   ├── [id].ts
│   │   │   ├── index.ts
│   │   │   └── onboard.ts
│   │   ├── admin/
│   │   │   └── freelancers.ts
│   │   ├── quote-request.ts
│   │   └── ... (existing API routes)
│   ├── freelancer/
│   │   └── [id].tsx
│   ├── freelancers.tsx
│   ├── apply.tsx
│   ├── admin.tsx
│   └── ... (existing pages)
├── lib/
│   ├── supabase.ts
│   └── ... (existing lib files)
├── types/
│   └── index.ts (updated with freelancer types)
└── ... (existing structure)
```

## Next Steps

1. **Implement Admin Authentication**: Add proper authentication to the admin dashboard
2. **Add Email Notifications**: Set up email notifications for applications and approvals
3. **Create Portfolio Upload**: Allow freelancers to upload portfolio images
4. **Add Search/Filtering**: Enhance the freelancer listing with better search
5. **Style Integration**: Ensure the freelancer pages match your main site design

## Security Reminders

- Never commit `.env.local` to version control
- Implement proper admin authentication before production
- Keep Supabase service role key secure
- Test all functionality thoroughly before going live
