# 🔐 Admin Dashboard Setup Guide

This guide explains how to set up and access the Admin Dashboard.

---

## 📋 Overview

The Admin Dashboard gives you (the platform owner) full visibility into:
- ✅ All clients and their subscriptions
- 💰 Global transaction history with filtering
- 📊 Revenue analytics and growth metrics
- 🔗 All payment links across all clients
- 🌐 Custom domains management
- 📈 MRR, churn, and other business metrics

**Admin Routes:**
- `/admin/dashboard` - Overview with global stats
- `/admin/clients` - Client management with filters
- `/admin/transactions` - All transactions with export to CSV
- `/admin/subscriptions` - Subscription & revenue analytics
- `/admin/payment-links` - Global payment links view
- `/admin/domains` - Custom domains management
- `/admin/analytics` - Advanced analytics (coming soon)

---

## 🚀 Step 1: Get Your Admin User ID

You need to add your Supabase user ID to the environment variables.

### Option A: From Supabase Dashboard

1. **Sign up/Login** to your app at `http://localhost:3000/signup` or your production URL
2. **Go to Supabase Dashboard** → Authentication → Users
3. **Find your user** in the list (look for your email)
4. **Copy the UUID** in the "ID" column (it looks like: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)

### Option B: From SQL Query

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this query**:
```sql
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
```
3. **Copy the id** value

---

## 🔧 Step 2: Add Admin User ID to Environment Variables

### Development (.env.local):

Add this line to your `.env.local` file:

```bash
# Admin Configuration
ADMIN_USER_ID=your-supabase-user-id-here
```

**Example:**
```bash
ADMIN_USER_ID=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

### Production (Vercel):

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add new variable**:
   - Key: `ADMIN_USER_ID`
   - Value: `your-supabase-user-id-here`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
3. **Redeploy** your app for changes to take effect

---

## ✅ Step 3: Verify Admin Access

1. **Restart your dev server** (if running locally):
   ```bash
   npm run dev
   ```

2. **Login to your app** with the email you used in Step 1

3. **Navigate to** `/admin/dashboard`

4. **You should see**:
   - Admin header with purple gradient
   - Sidebar navigation
   - Global stats dashboard

5. **If you see "Unauthorized" or get redirected to `/dashboard`**:
   - Double-check the `ADMIN_USER_ID` in `.env.local`
   - Make sure the ID matches your user ID exactly
   - Restart the dev server
   - Clear browser cache and try again

---

## 🔒 Security Notes

### Multiple Admins (Future)

To add more admin users, edit `lib/admin-auth.ts`:

```typescript
const ADMIN_USER_IDS = [
  process.env.ADMIN_USER_ID || '',
  'another-user-id-here',
  'yet-another-user-id-here',
];
```

### Role-Based Permissions (Future)

The current implementation has a permission system ready for expansion:

```typescript
export enum AdminPermission {
  VIEW_CLIENTS = 'view_clients',
  EDIT_CLIENTS = 'edit_clients',
  VIEW_TRANSACTIONS = 'view_transactions',
  VIEW_REVENUE = 'view_revenue',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  SUPER_ADMIN = 'super_admin',
}
```

You can implement role-based access by:
1. Creating an `admin_roles` table in Supabase
2. Storing user_id → permissions mapping
3. Updating `hasPermission()` function to check database

---

## 🎯 Features Implemented

### ✅ Dashboard Overview
- Total clients count
- Active subscriptions
- Transactions (last 30 days)
- Total revenue (all time)
- Recent revenue (last 7 days) with growth %
- Active payment links
- Custom domains
- MRR estimate

### ✅ Clients Page
- List all clients with stats
- Search by email or domain
- Filter by status (active, trial, expired)
- Filter by subscription plan
- View transaction count, payment links, and revenue per client
- Sort by date, revenue, etc.

### ✅ Transactions Page
- View all transactions globally
- Filter by client (tenant ID)
- Filter by date range
- Export to CSV
- Summary stats (total amount, average, count)
- See client email, customer email, amounts

### 🔄 Coming Soon
- Subscriptions with real-time data
- Advanced analytics with charts
- Payment links global view
- Domains management
- Revenue charts over time
- Cohort analysis
- Churn metrics

---

## 🐛 Troubleshooting

### "Unauthorized" error when accessing /admin

**Cause:** Your user ID is not in the admin list.

**Fix:**
1. Check `.env.local` has `ADMIN_USER_ID=your-id-here`
2. Verify the ID matches your Supabase user ID exactly
3. Restart dev server: `npm run dev`

### Can't see admin stats

**Cause:** API routes require admin authentication.

**Fix:**
1. Make sure you're logged in
2. Check browser console for errors
3. Verify Supabase connection is working
4. Check `/api/admin/stats` returns data (not 403)

### Stats showing 0

**Cause:** Database may be empty or RLS blocking access.

**Fix:**
1. Make sure you have some test data (tenants, transactions)
2. Check that admin API uses `supabaseAdmin` (bypasses RLS)
3. Verify service role key is correct in `.env.local`

---

## 📚 API Routes Reference

All admin API routes require authentication and admin permission:

### GET /api/admin/stats
Returns global statistics for dashboard overview.

**Response:**
```json
{
  "totalClients": 45,
  "activeClients": 38,
  "transactionsLast30Days": 127,
  "totalRevenue": 12567.50,
  "recentRevenue": 1234.00,
  "revenueGrowth": 15.3,
  "activePaymentLinks": 89,
  "customDomains": 12
}
```

### GET /api/admin/clients
Returns list of all clients with stats.

**Query params:**
- `search` - Search by email or domain
- `status` - Filter by status (all, active, trial, expired)
- `plan` - Filter by plan (all, starter, pro, enterprise)
- `sortBy` - Sort field (created_at, etc.)
- `sortOrder` - Sort direction (asc, desc)

**Response:**
```json
{
  "clients": [...],
  "total": 45
}
```

### GET /api/admin/transactions
Returns all transactions with optional filters.

**Query params:**
- `client` - Filter by tenant ID
- `dateFrom` - Start date (ISO format)
- `dateTo` - End date (ISO format)
- `minAmount` - Minimum amount (dollars)
- `maxAmount` - Maximum amount (dollars)
- `limit` - Max results (default 100)

**Response:**
```json
{
  "transactions": [...],
  "total": 127,
  "summary": {
    "totalAmount": 12567.50,
    "averageAmount": 98.95,
    "count": 127
  }
}
```

---

**Last Updated:** 2025-12-10
**Status:** ✅ Admin Dashboard v1 Complete
