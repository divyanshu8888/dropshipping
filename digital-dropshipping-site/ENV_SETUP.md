# Environment Setup

You need to create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/digital_dropshipping?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Stripe for payments
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Quick Setup Steps:

1. **Create the .env file:**
   ```bash
   cp ENV_SETUP.md .env
   # Then edit the .env file with your actual values
   ```

2. **Set up a PostgreSQL database:**
   - Use a service like Supabase, Railway, or local PostgreSQL
   - Update the DATABASE_URL with your connection string

3. **Run Prisma commands:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## For Quick Testing (Optional):
If you don't have a database set up yet, you can use SQLite for local development by changing the datasource in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
npm run dev
```
