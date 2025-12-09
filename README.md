# Payment Tracker SaaS

Multi-tenant SaaS platform for tracking Stripe payments with Hyros integration. Allows clients to use custom domains for thank you pages that automatically capture customer emails and send them to Hyros.

## Features

- 🎯 **Hyros Integration**: Automatically inject tracking scripts on thank you pages
- 🔗 **Custom Domains**: Support for client custom domains (ty.clientdomain.com)
- 💳 **Stripe Integration**: Create payment links and checkout sessions
- 📊 **Transaction Tracking**: View all payments and customer data
- 🔒 **Secure**: Encrypted Stripe API keys storage
- ⚡ **Fast Setup**: Get started in minutes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Hosting**: Vercel
- **Language**: TypeScript

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Stripe account
- Clerk account
- Supabase account
- Vercel account (for deployment)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Already configured in `.env.local`:
- ✅ Clerk credentials
- ✅ Supabase credentials
- ✅ App URLs

### 4. Create Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `wpwckfiiiqyeyvycwgyy`
3. Go to SQL Editor
4. Copy and run the SQL from `lib/supabase/schema.sql`

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Usage Guide

### For SaaS Admin (You)

1. **Test Locally**: Make sure everything works
2. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel deploy
   ```
3. **Upgrade to Vercel Pro** ($20/month) for custom domains support

### For Your Clients

1. **Sign Up**: Client creates account at your platform
2. **Configure Settings** (/dashboard/settings):
   - Add Stripe Secret Key
   - Add Stripe Publishable Key
   - Paste Hyros Universal Tracking Script
3. **Setup Custom Domain**:
   - Create CNAME: `ty.clientdomain.com → cname.vercel-dns.com`
   - Enter domain in dashboard
4. **Configure Stripe Success URL**:
   ```
   https://ty.clientdomain.com/ty?session_id={CHECKOUT_SESSION_ID}
   ```

## Project Structure

```
stripe-tracker-saas/
├── app/
│   ├── dashboard/            # Protected dashboard
│   │   ├── settings/         # Stripe + Hyros config
│   │   └── page.tsx          # Dashboard overview
│   ├── sign-in/              # Clerk authentication
│   ├── sign-up/              # Clerk registration
│   ├── ty/                   # Thank you page (dynamic)
│   └── page.tsx              # Landing page
├── lib/
│   ├── supabase/             # Database client & schema
│   ├── stripe/               # Stripe utilities
│   └── types/                # TypeScript types
└── middleware.ts             # Auth protection
```

## Database Schema

Run this SQL in Supabase:

```sql
-- See lib/supabase/schema.sql for complete schema
-- Creates tables:
-- - tenants (client accounts)
-- - payment_links (Stripe payment links)
-- - checkout_sessions (active sessions)
-- - transactions (completed payments)
```

## API Routes

- `GET /api/tenant` - Get current user's configuration
- `PUT /api/tenant` - Update Stripe keys and Hyros script
- `GET /ty?session_id=xxx` - Dynamic thank you page

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Required Vercel Configuration

1. Add all env variables from `.env.local`
2. Enable Vercel Pro for custom domains
3. Configure domain settings for wildcard support

## Next Steps

- [ ] Run `npm run dev` and test locally
- [ ] Create database schema in Supabase
- [ ] Sign up and configure your Stripe + Hyros settings
- [ ] Test the complete payment flow
- [ ] Deploy to Vercel
- [ ] Add your first client!

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys in `.env.local`
- Make sure schema is created
- Check RLS policies are enabled

### Stripe Errors
- Verify API keys are correct (test vs live)
- Check Stripe dashboard for errors
- Ensure success_url includes `{CHECKOUT_SESSION_ID}`

### Custom Domains
- Requires Vercel Pro ($20/month)
- CNAME must point to `cname.vercel-dns.com`
- Allow 5-10 minutes for DNS propagation

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to git
- Use environment variables for all secrets
- Enable Row Level Security in Supabase
- Implement Stripe webhooks for production

## Support

- [Next.js Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## License

MIT
