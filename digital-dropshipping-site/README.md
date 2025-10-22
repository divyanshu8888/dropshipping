# Digital Dropshipping Site

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
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   ├── products/       # Product pages
│   │   └── ...             # Other pages
│   ├── services/           # External service integrations
│   ├── styles/             # CSS styles
│   └── types/              # TypeScript type definitions
├── tests/                  # Test files
├── freelancer-showcase/    # Freelancer system (separate module)
└── ...                     # Configuration files
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local` with your configuration:

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
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management
All database operations are handled through the Supabase dashboard.

## Deployment

1. Set up production databases
2. Configure environment variables
3. Deploy to Vercel or your preferred platform
4. Set up domain and SSL certificates
5. Configure email notifications

## Support

For questions or issues:
1. Check the relevant documentation
2. Review the integration guide
3. Check environment variables
4. Verify database connections

## License

MIT License - see LICENSE file for details.