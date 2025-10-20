# Advanced Platform Setup Guide

This guide covers the implementation of the comprehensive dropshipping + freelancer marketplace platform with advanced chat moderation, supplier onboarding, and admin supervision features.

## 🏗️ Architecture Overview

The platform consists of:
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Real-time**: Supabase Realtime for chat
- **Storage**: Supabase Storage for file uploads
- **Authentication**: Custom role-based auth system

## 📋 Prerequisites

1. **Supabase Project**: Set up a Supabase project
2. **Environment Variables**: Configure all required environment variables
3. **Database Setup**: Run the advanced schema setup
4. **Edge Functions**: Deploy moderation functions

## 🔧 Environment Setup

Add these environment variables to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For production
SUPABASE_DB_PASSWORD=your_db_password
```

## 🗄️ Database Setup

### Step 1: Run the Advanced Schema

```bash
# Connect to your Supabase database and run:
psql -h your_db_host -U postgres -d postgres -f supabase/advanced-schema.sql
```

This creates:
- Enhanced user management with roles
- Conversation and messaging system
- Moderation rules and violation tracking
- Supplier and product management
- Audit logging and compliance
- Payment and escrow system

### Step 2: Set Up Moderation Rules

The schema automatically creates default moderation rules:
- **PRICING**: Detects pricing-related language
- **CONTACT**: Detects contact information sharing
- **URLS**: Detects external website links
- **PII**: Detects personal information sharing

### Step 3: Create Storage Buckets

In your Supabase dashboard, create these storage buckets:
- `supplier-documents` (for KYC documents)
- `project-files` (for project-related files)
- `message-attachments` (for chat attachments)

## 🔐 Authentication Setup

### Step 1: Create Admin User

```sql
-- Insert admin user (password generated during setup)
INSERT INTO users (id, email, name, password, role, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@platform.com', 'Platform Admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.4.2O', 'admin', true, true);
```

### Step 2: Configure RLS Policies

The schema includes comprehensive RLS policies for:
- User data access control
- Conversation participation
- Message viewing permissions
- Project access control

## 🚀 Edge Functions Setup

### Step 1: Deploy Moderation Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_ref

# Deploy the moderation function
supabase functions deploy moderate-message
```

### Step 2: Configure Function Environment

Set these environment variables for your Edge Function:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 💬 Chat System Implementation

### Features Implemented:
1. **Real-time messaging** with Supabase Realtime
2. **Multi-layer moderation** (client-side, server-side, database-level)
3. **Admin supervision** with live monitoring
4. **Structured alternatives** to prevent pricing discussions
5. **File sharing** with virus scanning
6. **User muting** and escalation system

### Usage:

```typescript
// In your React component
import ChatSystem from '../src/components/ChatSystem';

<ChatSystem
  conversationId={conversationId}
  userId={userId}
  isAdmin={isAdmin}
/>
```

## 👥 User Roles & Permissions

### Admin Users
- Full platform access
- Moderation dashboard
- User management
- Supplier approval
- Payment oversight

### Freelancer Users
- Profile management
- Project participation
- Chat with clients (moderated)
- Portfolio uploads

### Client Users
- Browse freelancers
- Request quotes
- Project management
- Chat with freelancers (moderated)

### Supplier Users
- Onboarding process
- Product catalog management
- Order fulfillment
- KYC verification

## 📊 Admin Dashboard Features

### Moderation Dashboard (`/admin/moderation`)
- Live conversation monitoring
- Violation tracking and statistics
- User muting and escalation
- Policy violation alerts

### Key Metrics:
- Violations per day/week
- Critical violation count
- Blocked messages
- Muted users
- Active conversations

## 🛒 Supplier Onboarding

### Features:
1. **Multi-step onboarding** form
2. **KYC verification** with document upload
3. **Business validation** process
4. **Document storage** in Supabase Storage
5. **Admin approval** workflow

### Process:
1. Supplier fills out onboarding form
2. Documents uploaded to secure storage
3. Admin reviews application
4. KYC verification process
5. Account activation

## 🔒 Security Features

### Chat Moderation:
1. **Client-side validation** (immediate feedback)
2. **Edge Function gatekeeper** (server-side blocking)
3. **Database-level enforcement** (RLS policies)
4. **Human-in-the-loop** (admin intervention)

### Data Protection:
- **Row Level Security** (RLS) on all tables
- **Audit logging** for all critical actions
- **File encryption** in storage
- **Secure document handling**

## 📈 Analytics & Reporting

### Implemented Metrics:
- User engagement statistics
- Moderation effectiveness
- Payment processing metrics
- Supplier performance
- Project completion rates

### Audit Trail:
- All user actions logged
- Message moderation events
- Payment transactions
- Admin interventions

## 🚀 Deployment

### Vercel Deployment:
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Supabase Functions:
```bash
supabase functions deploy
```

### Database Migrations:
```bash
supabase db push
```

## 🔧 Customization

### Moderation Rules:
Edit patterns in `supabase/moderation-functions.sql`:

```sql
-- Add custom patterns
INSERT INTO moderation_rules (code, name, description, pattern, action, severity) VALUES
('CUSTOM_RULE', 'Custom Rule', 'Detects custom violations', 'your_regex_pattern', 'redact', 'medium');
```

### Chat Policies:
Modify RLS policies in the schema to adjust access control.

### UI Components:
All components are modular and can be customized in the `src/components/` directory.

## 🐛 Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Check user permissions and role assignments
2. **Moderation Function Errors**: Verify Edge Function deployment and environment variables
3. **Real-time Connection Issues**: Check Supabase Realtime configuration
4. **File Upload Errors**: Verify storage bucket permissions

### Debug Mode:
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📚 API Documentation

### Key Endpoints:

- `POST /api/messages` - Send moderated message
- `POST /api/suppliers/onboard` - Supplier onboarding
- `POST /api/quote-request` - Quote request submission
- `GET /api/admin/moderation` - Moderation dashboard data

### RPC Functions:

- `send_message(conversation_id, body, reply_to)` - Send message with moderation
- `create_conversation(title, project_id, participants)` - Create new conversation
- `get_moderation_dashboard()` - Get admin moderation data
- `toggle_user_mute(conversation_id, user_id, duration)` - Mute/unmute user

## 🔄 Maintenance

### Regular Tasks:
1. **Monitor moderation metrics** for effectiveness
2. **Review violation patterns** and update rules
3. **Audit user permissions** and access logs
4. **Update moderation patterns** based on new threats
5. **Backup audit logs** for compliance

### Performance Optimization:
1. **Index optimization** for large datasets
2. **Real-time connection pooling**
3. **Edge Function caching**
4. **Storage cleanup** for old files

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs
3. Check Edge Function logs
4. Verify environment variables
5. Test with minimal reproduction case

## 🎯 Next Steps

After basic setup:
1. **Configure payment processing** (Stripe integration)
2. **Implement e-signature** for contracts
3. **Add advanced analytics** dashboard
4. **Set up automated testing**
5. **Configure monitoring** and alerts

This comprehensive setup provides a production-ready platform with enterprise-level security, moderation, and user management features.
