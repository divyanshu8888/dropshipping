# Cron Job Setup for Auto-Approval

This document explains how to set up automated milestone auto-approval using cron jobs.

## Overview

The auto-approval system automatically approves milestones that have been in `submitted` status for more than 5 business days. This prevents clients from holding up payments indefinitely.

## API Endpoint

**Endpoint:** `/api/milestones/auto-approve`  
**Method:** `GET` or `POST`  
**Authentication:** None required (internal endpoint)

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

If you're deploying on Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/milestones/auto-approve",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

This runs every weekday at 9 AM UTC (Monday-Friday).

### Option 2: External Cron Service

Use services like:
- **cron-job.org** (free)
- **EasyCron** (free tier available)
- **GitHub Actions** (for GitHub-hosted projects)

#### cron-job.org Setup:
1. Sign up at https://cron-job.org
2. Create a new cron job
3. URL: `https://yourdomain.com/api/milestones/auto-approve`
4. Schedule: `0 9 * * 1-5` (Every weekday at 9 AM)
5. Method: GET

### Option 3: Server Cron (Linux/Mac)

If you have server access, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs every weekday at 9 AM)
0 9 * * 1-5 curl -X GET https://yourdomain.com/api/milestones/auto-approve
```

### Option 4: GitHub Actions

Create `.github/workflows/auto-approve-milestones.yml`:

```yaml
name: Auto-Approve Milestones

on:
  schedule:
    # Runs every weekday at 9 AM UTC
    - cron: '0 9 * * 1-5'
  workflow_dispatch: # Allows manual trigger

jobs:
  auto-approve:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Approval
        run: |
          curl -X GET ${{ secrets.SITE_URL }}/api/milestones/auto-approve
```

## Testing

### Manual Test

You can manually trigger the endpoint:

```bash
curl -X GET https://yourdomain.com/api/milestones/auto-approve
```

Or visit in browser:
```
https://yourdomain.com/api/milestones/auto-approve
```

### Expected Response

```json
{
  "success": true,
  "message": "Auto-approved 3 milestone(s)",
  "autoApproved": 3,
  "milestoneIds": [123, 124, 125]
}
```

## Schedule Recommendations

### Business Days Only
- **Schedule:** `0 9 * * 1-5` (Monday-Friday at 9 AM)
- **Why:** Auto-approval uses business days, so running on weekends is unnecessary

### Frequency
- **Daily:** Recommended - ensures timely approvals
- **Twice Daily:** Optional - morning and afternoon checks
- **Hourly:** Not recommended - too frequent

### Time Zone Considerations
- Default schedule uses UTC
- Adjust based on your primary timezone
- Example for EST (UTC-5): `0 14 * * 1-5` (9 AM EST = 2 PM UTC)

## Monitoring

### Logs
Check your application logs for:
- Number of milestones auto-approved
- Any errors during the process
- Project status updates

### Alerts
Set up alerts for:
- Failed cron job executions
- Unusual number of auto-approvals
- Errors in the auto-approval process

## Security

### Recommended: Add Authentication

For production, consider adding authentication:

```typescript
// In auto-approve.ts
const authToken = req.headers['x-cron-secret'];
if (authToken !== process.env.CRON_SECRET) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Then set `CRON_SECRET` in your environment variables and include it in cron requests.

## Troubleshooting

### Cron Not Running
1. Check cron service status
2. Verify URL is accessible
3. Check application logs for errors
4. Test endpoint manually

### Milestones Not Auto-Approving
1. Verify milestones are in `submitted` status
2. Check if `submitted_at` is set correctly
3. Verify 5 business days have passed
4. Check database for any constraints

### Performance Issues
- The endpoint processes milestones sequentially
- For large numbers, consider batching
- Monitor execution time

## Best Practices

1. **Monitor Regularly:** Check logs weekly
2. **Test First:** Test on staging before production
3. **Backup:** Ensure database backups before enabling
4. **Documentation:** Keep this setup documented
5. **Alerts:** Set up monitoring alerts

