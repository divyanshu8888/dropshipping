# Database Setup Files

This directory contains the organized SQL files for setting up the complete dropshipping + freelancer marketplace platform database.

## 📁 File Organization

### **00-complete-setup.sql** - Master Setup File
- **Purpose**: Runs all other files in the correct order
- **Usage**: `psql -f 00-complete-setup.sql` (recommended for new setups)
- **Contains**: Imports all other SQL files sequentially

### **01-core-schema.sql** - Core Database Structure
- **Purpose**: Creates all basic tables and relationships
- **Includes**: Users, freelancers, suppliers, products, projects, quotes
- **Dependencies**: None (base schema)

### **02-chat-moderation.sql** - Chat & Moderation System
- **Purpose**: Real-time messaging with comprehensive moderation
- **Includes**: Conversations, messages, moderation rules, violation tracking
- **Dependencies**: Requires 01-core-schema.sql

### **03-payments-escrow.sql** - Payment & Financial System
- **Purpose**: Milestone-based payments and financial management
- **Includes**: Escrow accounts, payments, payouts, disputes
- **Dependencies**: Requires 01-core-schema.sql

### **04-audit-compliance.sql** - Audit & Compliance
- **Purpose**: Comprehensive logging and compliance tracking
- **Includes**: Audit logs, triggers, compliance functions
- **Dependencies**: Requires 01-core-schema.sql

### **05-rls-policies.sql** - Security Policies
- **Purpose**: Row-level security and access control
- **Includes**: RLS policies for all tables, user permissions
- **Dependencies**: Requires 01-04 files

### **06-sample-data.sql** - Sample Data
- **Purpose**: Optional sample data for testing
- **Includes**: Admin user, testimonials, sample products
- **Dependencies**: Requires all previous files

## 🚀 Quick Setup

### Option 1: Complete Setup (Recommended)
```bash
# Run the master setup file
psql -h your-db-host -U postgres -d postgres -f 00-complete-setup.sql
```

### Option 2: Step-by-Step Setup
```bash
# Run files individually in order
psql -h your-db-host -U postgres -d postgres -f 01-core-schema.sql
psql -h your-db-host -U postgres -d postgres -f 02-chat-moderation.sql
psql -h your-db-host -U postgres -d postgres -f 03-payments-escrow.sql
psql -h your-db-host -U postgres -d postgres -f 04-audit-compliance.sql
psql -h your-db-host -U postgres -d postgres -f 05-rls-policies.sql
psql -h your-db-host -U postgres -d postgres -f 06-sample-data.sql
```

## 🔧 Individual File Setup

If you only need specific features:

### For Basic Platform (Users + Products)
```bash
psql -h your-db-host -U postgres -d postgres -f 01-core-schema.sql
psql -h your-db-host -U postgres -d postgres -f 05-rls-policies.sql
psql -h your-db-host -U postgres -d postgres -f 06-sample-data.sql
```

### For Chat System
```bash
psql -h your-db-host -U postgres -d postgres -f 01-core-schema.sql
psql -h your-db-host -U postgres -d postgres -f 02-chat-moderation.sql
psql -h your-db-host -U postgres -d postgres -f 05-rls-policies.sql
```

### For Payments
```bash
psql -h your-db-host -U postgres -d postgres -f 01-core-schema.sql
psql -h your-db-host -U postgres -d postgres -f 03-payments-escrow.sql
psql -h your-db-host -U postgres -d postgres -f 05-rls-policies.sql
```

## 📋 Features Included

### ✅ **Core Platform**
- User management with roles (admin, freelancer, client, supplier)
- Freelancer profiles and portfolios
- Supplier onboarding and KYC
- Product catalog management
- Project and quote management

### ✅ **Chat & Moderation**
- Real-time messaging system
- Multi-layer moderation (client-side, server-side, database-level)
- Violation detection and redaction
- Admin supervision tools
- User muting and escalation

### ✅ **Payments & Escrow**
- Milestone-based escrow system
- Payment processing
- Payout management
- Dispute resolution
- Financial auditing

### ✅ **Security & Compliance**
- Row-level security policies
- Comprehensive audit logging
- Data encryption and protection
- Role-based access control
- GDPR compliance features

## 🔑 Default Admin User

After running the setup, you'll have an admin user:
- **Email**: `admin@platform.com`
- **Password**: [Generated during setup]
- **Role**: `admin`

## 🌐 Next Steps

1. **Set up environment variables** in `.env.local`
2. **Deploy Edge Functions** for moderation
3. **Configure Supabase Storage** buckets
4. **Start development server**
5. **Test admin login** at `/admin`

## 📚 Additional Files

- `moderation-functions.sql` - Database functions for chat moderation
- `functions/moderate-message/index.ts` - Edge Function for message moderation

## ⚠️ Important Notes

- **Backup your database** before running setup scripts
- **Test in development** before production deployment
- **Review RLS policies** for your security requirements
- **Customize moderation rules** for your platform needs

## 🆘 Troubleshooting

### Common Issues:
1. **Permission errors**: Ensure you're using a superuser account
2. **Extension errors**: Verify PostgreSQL extensions are available
3. **RLS policy conflicts**: Check for conflicting policies
4. **Foreign key errors**: Ensure tables are created in correct order

### Support:
- Check the `ADVANCED_SETUP_GUIDE.md` for detailed instructions
- Review error messages for specific issues
- Test individual files if complete setup fails
