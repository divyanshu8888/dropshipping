# Freelancer Showcase Deployment Guide

## Production Setup

### 1. Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for production
   - Note the production URL and API keys

2. **Run Database Schema**
   - Copy `database/supabase-schema.sql`
   - Execute in production Supabase SQL editor

3. **Configure Storage**
   - Set up production storage bucket
   - Configure CORS policies for your domain

### 2. Environment Variables (Production)

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Production URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 3. Security Checklist

- [ ] Implement admin authentication
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up email notifications
- [ ] Enable SSL/HTTPS
- [ ] Configure backup strategies
- [ ] Set up monitoring and logging

### 4. Admin Authentication

**Recommended**: Use Supabase Auth for admin authentication

```typescript
// Example admin auth middleware
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Check if user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    
    if (!admin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
  
  return res
}
```

### 5. Email Notifications

Set up email notifications for:
- Freelancer application confirmations
- Admin notifications for new applications
- Freelancer approval/rejection notifications
- Quote request notifications

### 6. Performance Optimization

- [ ] Enable Supabase caching
- [ ] Optimize database queries
- [ ] Implement image optimization
- [ ] Set up CDN for static assets
- [ ] Configure proper indexing

### 7. Monitoring

Set up monitoring for:
- Application errors
- Database performance
- API response times
- User activity
- Security events

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables

### Self-hosted
1. Set up server with Node.js
2. Configure reverse proxy (Nginx)
3. Set up SSL certificates
4. Configure process manager (PM2)

## Post-Deployment

1. **Test all functionality**
   - Freelancer applications
   - Admin dashboard
   - Public showcase
   - Quote requests

2. **Set up backups**
   - Database backups
   - File storage backups
   - Configuration backups

3. **Monitor performance**
   - Set up alerts
   - Monitor error rates
   - Track user engagement

4. **Security audit**
   - Review access logs
   - Check for vulnerabilities
   - Update dependencies

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor database performance
- Review and clean up old data
- Backup verification
- Security updates

### Scaling Considerations
- Database connection pooling
- CDN implementation
- Load balancing
- Caching strategies
- Database sharding (if needed)

## Support

For deployment issues:
1. Check environment variables
2. Verify database connections
3. Review error logs
4. Test in staging environment first
5. Contact support if needed
