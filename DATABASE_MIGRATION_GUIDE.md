# Database Migration Guide - Run Supabase Migrations

## ❌ Issue

You're getting this error:
```
Could not find the table 'public.imported_wallets' in the schema cache
```

This means **database tables haven't been created yet**. We need to run the SQL migrations to create all required tables.

---

## ✅ Solution - Run Migrations via Supabase Dashboard

### Step 1: Open Supabase Dashboard

1. Go to: [https://app.supabase.com](https://app.supabase.com)
2. Log in with your account
3. Select project: **heyaknwrcuskmwwefsiy**
4. Click: **SQL Editor** (left sidebar)

### Step 2: Run First Migration (profiles, KYC, wallets, transactions)

1. Click: **New Query**
2. Copy entire contents of: `supabase/migrations/20260121085736_2172fe85-b0cc-45bd-86c0-dd77bf849e43.sql`
3. Paste into the SQL editor
4. Click: **RUN** (blue button, bottom right)
5. Wait for success ✅

### Step 3: Run Second Migration (KYC documents storage)

1. Click: **New Query**
2. Copy entire contents of: `supabase/migrations/20260122133628_aa91727b-84f1-4c88-8173-9a4165f6394b.sql`
3. Paste into the SQL editor
4. Click: **RUN**
5. Wait for success ✅

### Step 4: Run Third Migration (KYC auto-approve & realtime)

1. Click: **New Query**
2. Copy entire contents of: `supabase/migrations/20260122195204_1c8e3333-0a6c-4cf4-b67e-7bf695c00f57.sql`
3. Paste into the SQL editor
4. Click: **RUN**
5. Wait for success ✅

### Step 5: Run Fourth Migration (wallet fields)

1. Click: **New Query**
2. Copy entire contents of: `supabase/migrations/20260201165531_d6407ceb-92c5-4753-8d1b-50da17b627fc.sql`
3. Paste into the SQL editor
4. Click: **RUN**
5. Wait for success ✅

### Step 6: Run Fifth Migration (imported_wallets table) ⭐ CRITICAL

1. Click: **New Query**
2. Copy entire contents of: `supabase/migrations/20260202_imported_wallets.sql`
3. Paste into the SQL editor
4. Click: **RUN**
5. Wait for success ✅

---

## 🔍 Verify Migrations Worked

After running all 5 migrations, verify the tables exist:

### Check Created Tables

In Supabase Dashboard:
1. Go to: **Database** (left sidebar)
2. Click: **Schemas** > **public**
3. You should see these tables:
   - ✅ `profiles`
   - ✅ `kyc_verifications`
   - ✅ `wallet_connections`
   - ✅ `transactions`
   - ✅ `imported_wallets` ⭐ (Most important!)

### Quick Verification Query

Run this in SQL Editor to confirm `imported_wallets` exists:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'imported_wallets';
```

Should return: `imported_wallets`

---

## 🆘 Troubleshooting

### Error: "relation does not exist"

**Solution:** Make sure you ran all 5 migrations in order. Go back to Step 1 and run any missing migrations.

### Error: "already exists"

**Solution:** The table already exists (good!). Click through the error. It's from the `IF NOT EXISTS` clause.

### "Query Timeout"

**Solution:** The query is taking too long. Click **Stop** and try running smaller queries or refresh the page and retry.

### Still getting "Could not find table" error in app

**Solution:** 
1. ✅ Make sure you ran **all 5 migrations** (especially #5!)
2. ✅ **Restart your dev server** (npm run dev)
3. ✅ Clear browser cache (Ctrl+Shift+Delete)
4. ✅ Hard refresh (Ctrl+Shift+R)

---

## 📋 What Each Migration Creates

| Migration | Creates |
|-----------|---------|
| **1** (20260121...) | profiles, kyc_verifications, wallet_connections, transactions, RLS policies |
| **2** (20260122133...) | Storage bucket (kyc-documents), storage policies, KYC form fields |
| **3** (20260122195...) | Auto-approve KYC (for testing), realtime for transactions |
| **4** (20260201...) | KYC step tracking, wallet names, seed hash, multi-chain addresses |
| **5** (20260202...) | **imported_wallets table** ⭐ (this fixes your error!) |

---

## ✅ After Migrations are Complete

1. ✅ All database tables exist
2. ✅ All RLS policies are set up
3. ✅ All indexes are created
4. ✅ Storage buckets are configured

### Now you can:
- ✅ Create wallets (will save to `wallet_connections`)
- ✅ Import wallets (will save to `imported_wallets`)
- ✅ Submit KYC (will save to `kyc_verifications`)
- ✅ Send notifications to Telegram ✅

---

## 🚀 Next Steps

After migrations complete:

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:5173/dashboard/wallets`
3. Try creating or importing a wallet
4. It should work now! ✅

---

## 📝 Notes

- **Migrations are idempotent**: Running them twice won't cause issues (they use `IF NOT EXISTS`)
- **Order matters**: Run them in the order listed above
- **You only need to do this once**: After migrations run, they're done forever
- **Supabase handles the rest**: No CLI needed, just the dashboard

---

## 🎯 TL;DR - Quick Steps

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `heyaknwrcuskmwwefsiy`
3. Click **SQL Editor** → **New Query**
4. Paste each migration file (in order) and click **RUN**
5. Do this 5 times (one for each migration file)
6. Done! ✅

**Your error will be fixed immediately after running migration #5.**

---

**Questions?** Check the Supabase docs: [https://supabase.com/docs/guides/database/migrations](https://supabase.com/docs/guides/database/migrations)
