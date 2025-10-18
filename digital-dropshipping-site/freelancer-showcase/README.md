# Freelancer Showcase System

A secure, privacy-focused freelancer showcase platform built with Next.js and Supabase.

## Features

- **Secure Freelancer Onboarding**: Freelancers can apply with their portfolio, skills, and base fee
- **Privacy Protection**: Contact information and base fees are hidden from public view
- **Admin Dashboard**: Review and approve freelancer applications
- **Public Showcase**: Browse approved freelancers and their portfolios
- **Quote Requests**: Clients can request quotes without seeing sensitive information

## Architecture

### Database (Supabase)
- **Tables**: `freelancers`, `portfolio_items`, `admins`
- **Views**: `freelancers_public`, `portfolio_public` (hide sensitive data)
- **RLS Policies**: Row-level security ensures data privacy
- **Storage**: Portfolio images stored in Supabase Storage

### API Routes
- `/api/freelancers/onboard` - Freelancer application submission
- `/api/freelancers` - Public freelancer listing
- `/api/freelancers/[id]` - Individual freelancer profile
- `/api/admin/freelancers` - Admin management
- `/api/quote-request` - Client quote requests

### Pages
- `/freelancers` - Public freelancer showcase
- `/freelancer/[id]` - Individual freelancer profile
- `/apply` - Freelancer application form
- `/admin` - Admin dashboard

## Setup Instructions

### 1. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/supabase-schema.sql`
3. Set up your environment variables

### 2. Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## Security Features

1. **Row-Level Security (RLS)**: Database-level privacy protection
2. **Public Views**: Only non-sensitive data exposed to public
3. **Service Role**: Server-side operations use service role key
4. **Input Validation**: All forms include proper validation
5. **Admin Authentication**: Admin routes protected (implement your auth)

## File Structure

```
freelancer-showcase/
├── database/
│   └── supabase-schema.sql    # Database schema and RLS policies
├── api/
│   ├── freelancers/           # Freelancer API routes
│   ├── admin/                 # Admin API routes
│   └── quote-request.ts       # Quote request handler
├── pages/
│   ├── freelancers.tsx        # Public freelancer listing
│   ├── freelancer/[id].tsx    # Individual freelancer profile
│   ├── apply.tsx              # Freelancer application form
│   └── admin.tsx              # Admin dashboard
├── components/                # Reusable components (to be created)
├── types/                     # TypeScript type definitions
└── README.md                  # This file
```

## Usage

### For Freelancers
1. Visit `/apply` to submit an application
2. Fill out the form with your details, skills, and base fee
3. Wait for admin approval
4. Once approved, your profile will appear in the public showcase

### For Clients
1. Browse freelancers at `/freelancers`
2. View individual profiles at `/freelancer/[id]`
3. Request quotes through the contact form
4. Admin will connect you with the freelancer

### For Admins
1. Access admin dashboard at `/admin`
2. Review pending applications
3. Approve or reject freelancers
4. View all freelancer details including contact info and base fees

## Privacy Guarantees

- **Contact Information**: Never exposed to public
- **Base Fees**: Only visible to admins
- **Database Views**: Automatically filter sensitive data
- **RLS Policies**: Prevent unauthorized access at database level

## Next Steps

1. Implement proper admin authentication
2. Add email notifications for applications and approvals
3. Create portfolio upload functionality
4. Add search and filtering capabilities
5. Implement payment processing for completed projects
6. Add analytics and reporting features

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
