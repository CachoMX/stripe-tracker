# 🚀 Setup Guide - Payment Tracker SaaS

## ✅ What's Already Done

- ✅ Next.js 14 project created
- ✅ All dependencies installed
- ✅ Clerk authentication configured
- ✅ Supabase connection configured
- ✅ Environment variables set up
- ✅ Landing page created
- ✅ Dashboard with navigation
- ✅ Settings page for Stripe + Hyros
- ✅ Thank you page with dynamic tenant resolution
- ✅ Build successful

## 📋 Final Steps to Complete

### Step 1: Create Database Schema in Supabase

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wpwckfiiiqyeyvycwgyy

2. Go to **SQL Editor** (left sidebar)

3. Click **New Query**

4. Copy and paste the entire content from: `lib/supabase/schema.sql`

5. Click **Run** (or press Ctrl+Enter)

6. You should see: ✅ Success messages for all tables created

### Step 2: Test Locally

```bash
cd stripe-tracker-saas
npm run dev
```

Visit: http://localhost:3000

### Step 3: Create Your Account

1. Click "Get Started" or "Sign Up"
2. Create your account with Clerk
3. You'll be redirected to the dashboard

### Step 4: Configure Your Settings

1. Go to `/dashboard/settings`
2. Add your Stripe keys (get them from https://dashboard.stripe.com/test/apikeys)
3. Paste your Hyros tracking script
4. Click "Save Settings"

### Step 5: Test the Thank You Page Flow

#### Option A: Using an Existing Stripe Payment Link

1. Go to Stripe Dashboard → Payment Links
2. Create a payment link for $1.00
3. Set the success URL to:
   ```
   http://localhost:3000/ty?session_id={CHECKOUT_SESSION_ID}
   ```
4. Make a test payment
5. Verify the thank you page shows with your Hyros script injected

#### Option B: Using Your Own Stripe Checkout

1. Use the Stripe keys you configured
2. Create a checkout session with success_url pointing to `/ty?session_id={CHECKOUT_SESSION_ID}`
3. Complete the payment
4. Check the thank you page

### Step 6: Deploy to Vercel

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel

# Follow the prompts
# Link to existing project or create new one
```

After deployment:

1. Go to Vercel Dashboard → Your Project → Settings
2. Add all environment variables from `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

3. Redeploy after adding env variables

### Step 7: Set Up Custom Domains (Optional - Requires Vercel Pro)

**Cost**: $20/month for Vercel Pro

1. Upgrade to Vercel Pro
2. In Vercel Dashboard → Domains
3. Add your domain (e.g., `paymenttracker.com`)
4. Add wildcard domain: `*.paymenttracker.com` (if supported)

OR for client-specific domains:

1. Client creates CNAME:
   ```
   ty.clientdomain.com → CNAME → cname.vercel-dns.com
   ```

2. In your app, go to Vercel dashboard
3. Add the client's custom domain
4. Wait for SSL certificate (~30 seconds)

## 🎯 How It Works (Full Flow)

### For Your Clients:

1. **Client Signs Up** → Creates account on your platform

2. **Client Configures Settings** → Adds:
   - Stripe Secret Key
   - Stripe Publishable Key
   - Hyros Universal Tracking Script

3. **Client Sets Up CNAME** → Points:
   ```
   ty.theirdomain.com → cname.vercel-dns.com
   ```

4. **Client Creates Payment Link** → In Stripe or your dashboard:
   - Product: "Their Product"
   - Amount: $X.XX
   - Success URL: `https://ty.theirdomain.com/ty?session_id={CHECKOUT_SESSION_ID}`

5. **Customer Pays** → Stripe redirects to:
   ```
   https://ty.theirdomain.com/ty?session_id=cs_test_xxx
   ```

6. **Your App**:
   - Detects custom domain `ty.theirdomain.com`
   - Finds tenant in database by domain
   - Retrieves Stripe session using client's secret key
   - Gets customer email from session
   - Renders thank you page with:
     - Client's Hyros script in `<head>`
     - Customer email displayed on page
   - Logs transaction in database

7. **Hyros** → Tracks the customer email automatically

## 🔍 Testing Checklist

- [ ] Database schema created in Supabase
- [ ] Can sign up and log in
- [ ] Dashboard loads correctly
- [ ] Can save Stripe keys and Hyros script
- [ ] Thank you page works with test Stripe session
- [ ] Hyros script appears in page source
- [ ] Transaction logged in database
- [ ] Build succeeds without errors
- [ ] Deployment to Vercel successful

## 📊 Current Project Status

```
✅ Backend: Complete
✅ Frontend: Complete
✅ Authentication: Complete
✅ Database Schema: Ready (needs to be run)
✅ Stripe Integration: Complete
✅ Hyros Integration: Complete
✅ Thank You Page: Complete
⏳ Custom Domains: Ready (needs Vercel Pro)
⏳ Production Deploy: Ready to deploy
```

## 🐛 Common Issues & Solutions

### Issue: "Tenant not found"
**Solution**: Make sure you're logged in and the tenant was created when you first logged in

### Issue: Stripe API error
**Solution**:
- Verify API keys in settings
- Check if using test keys (sk_test_ / pk_test_)
- Ensure keys are from the same Stripe account

### Issue: Thank you page doesn't show email
**Solution**:
- Check session_id is in URL
- Verify Stripe secret key is configured
- Check browser console for errors

### Issue: Hyros not tracking
**Solution**:
- View page source and verify script is injected
- Check browser console for script errors
- Ensure script format is correct

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Vercel**: https://vercel.com/docs

## 🎉 Next Features to Build

Once core is working:

- [ ] Payment Links creator in dashboard
- [ ] Checkout Sessions generator
- [ ] Transaction analytics
- [ ] Webhook handler for real-time updates
- [ ] Email notifications
- [ ] Custom thank you page templates
- [ ] Subscription billing for your SaaS

---

## 🚀 Ready to Launch!

Your SaaS is ready to go. Complete Steps 1-6 above and you'll have a fully functional multi-tenant payment tracking platform!

**Estimated time to complete setup**: 15-30 minutes

Good luck! 🎯
