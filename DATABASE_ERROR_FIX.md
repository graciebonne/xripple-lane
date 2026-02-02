# 🔧 DATABASE ERROR - COMPLETE SOLUTION

## Your Error
```
Could not find the table 'public.imported_wallets' in the schema cache
```

This error appears when trying to **create or import a wallet**.

---

## Root Cause
**Database tables were never created.** Your code is trying to save wallet data, but the tables don't exist in Supabase yet.

---

## Solution Overview

| Issue | Solution | Time |
|-------|----------|------|
| Tables don't exist | Run SQL migrations | 5 min |
| Wrong credentials | Check .env.local | 2 min |
| Migrations files present? | Yes, in `supabase/migrations/` | ✅ |
| Database schema? | Need to create via SQL | 🔧 |

---

## 🚀 HOW TO FIX (Choose One)

### Option A: FASTEST - Copy SQL Below (Recommended)

**Time: 3 minutes**

1. Go to: [https://app.supabase.com/project/heyaknwrcuskmwwefsiy/sql/new](https://app.supabase.com/project/heyaknwrcuskmwwefsiy/sql/new)
2. Open **SQL Editor** → Click **+ New Query**
3. Paste the combined SQL below:

<details>
<summary>👉 CLICK TO SHOW SQL (Copy & Paste This)</summary>

```sql
-- ============================================
-- CREATE ALL DATABASE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TYPE IF NOT EXISTS public.kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.kyc_status NOT NULL DEFAULT 'not_started',
  document_type TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  kyc_step INTEGER DEFAULT 1,
  ssn_encrypted TEXT,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  phone_number TEXT
);

CREATE TYPE IF NOT EXISTS public.wallet_type AS ENUM ('metamask', 'walletconnect', 'coinbase', 'phantom', 'tronlink', 'bitcoin');

CREATE TABLE IF NOT EXISTS public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_type public.wallet_type NOT NULL,
  wallet_address TEXT NOT NULL,
  chain_id TEXT,
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wallet_name TEXT,
  seed_hash TEXT,
  evm_address TEXT,
  solana_address TEXT,
  tron_address TEXT,
  UNIQUE(user_id, wallet_address)
);

CREATE TYPE IF NOT EXISTS public.transaction_type AS ENUM ('buy', 'swap', 'send', 'receive');
CREATE TYPE IF NOT EXISTS public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  source_chain TEXT,
  source_token TEXT,
  source_amount DECIMAL(20, 8),
  destination_chain TEXT DEFAULT 'XRP',
  destination_token TEXT DEFAULT 'XRP',
  destination_amount DECIMAL(20, 8),
  destination_address TEXT,
  tx_hash TEXT,
  fee_amount DECIMAL(20, 8),
  fee_currency TEXT,
  moonpay_transaction_id TEXT,
  fiat_currency TEXT,
  fiat_amount DECIMAL(20, 2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.imported_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  xrp_address TEXT NOT NULL,
  xrp_balance TEXT DEFAULT '0',
  evm_address TEXT,
  solana_address TEXT,
  tron_address TEXT,
  bitcoin_address TEXT,
  seed_hash TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, xrp_address)
);

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.imported_wallets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- KYC
CREATE POLICY IF NOT EXISTS "Users can view their own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallet Connections
CREATE POLICY IF NOT EXISTS "Users can view their own wallet connections" ON public.wallet_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own wallet connections" ON public.wallet_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own wallet connections" ON public.wallet_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own wallet connections" ON public.wallet_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Imported Wallets ⭐ CRITICAL
CREATE POLICY IF NOT EXISTS "Users can view their own imported wallets" ON public.imported_wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own imported wallets" ON public.imported_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own imported wallets" ON public.imported_wallets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own imported wallets" ON public.imported_wallets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_user_id ON public.imported_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_xrp_address ON public.imported_wallets(xrp_address);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_imported_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_imported_wallets_timestamp ON public.imported_wallets;
CREATE TRIGGER update_imported_wallets_timestamp
  BEFORE UPDATE ON public.imported_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imported_wallets_timestamp();

-- ============================================
-- ALL DONE! ✅
-- ============================================
```

</details>

4. Click **RUN** (bottom right)
5. Wait for success ✅
6. Done!

---

### Option B: DETAILED - Step-by-Step Guide

**Time: 10 minutes**

Read: [DATABASE_FIX_STEPS.md](./DATABASE_FIX_STEPS.md)

This guide walks you through each step with screenshots.

---

### Option C: COMPREHENSIVE - Full Migration Guide

**Time: 15 minutes**

Read: [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

This covers all 5 migration files with detailed explanations.

---

## ✅ AFTER Running SQL

### 1. Verify Tables Exist

In Supabase Dashboard:
- Click **Database** (left sidebar)
- Click **Schemas** → **public**
- Look for these tables:
  - ✅ `profiles`
  - ✅ `kyc_verifications`
  - ✅ `wallet_connections`
  - ✅ `transactions`
  - ✅ `imported_wallets` ⭐ **The critical one**

### 2. Restart Your App

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### 3. Test It

- Go to: `http://localhost:5173/dashboard/wallets`
- Try **Creating a wallet**
- Check console for errors
- Should work now! ✅

---

## 📊 What You're Creating

### Tables:
| Table | Purpose | Records |
|-------|---------|---------|
| `profiles` | User info (name, email, avatar) | 1 per user |
| `kyc_verifications` | KYC submission data | 1 per user |
| `wallet_connections` | External wallets (MetaMask, Phantom, etc) | Many per user |
| `transactions` | Buy/swap/send history | Many per user |
| `imported_wallets` | **Seeds you import/create** ⭐ | Many per user |

### Security:
- ✅ Row Level Security (RLS) - Users only see their own data
- ✅ Indexes - Fast lookups
- ✅ Triggers - Auto-update timestamps

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**This is fine!** It means the table already exists. Just continue.

### Still getting "table not found" after SQL runs
1. ✅ **Verify** table exists in Supabase Dashboard (Database → Schemas → public)
2. ✅ **Restart** dev server: `npm run dev`
3. ✅ **Hard refresh** browser: `Ctrl+Shift+R`
4. ✅ **Check** browser console for other errors

### Can't see tables in Supabase
1. Make sure you're logged in
2. Make sure you selected the right project: `heyaknwrcuskmwwefsiy`
3. Go to **Database** tab (not SQL Editor)
4. Click **Schemas** → **public**

### Error: "permission denied"
This shouldn't happen with your account. Check that:
- You own the Supabase project
- You're not in "view-only" mode
- You logged in correctly

---

## 📋 What You Already Have

✅ **Migration files** exist in your project:
- `supabase/migrations/20260121085736_...sql` (profiles, KYC, wallets, transactions)
- `supabase/migrations/20260122133628_...sql` (storage setup)
- `supabase/migrations/20260122195204_...sql` (KYC auto-approve)
- `supabase/migrations/20260201165531_...sql` (wallet fields)
- `supabase/migrations/20260202_...sql` (imported_wallets) ⭐

✅ **Code** is ready to use these tables:
- `src/services/walletService.ts` - Saves/retrieves wallets
- `src/pages/Wallets.tsx` - Creates/imports wallets
- `src/pages/KYCVerification.tsx` - Submits KYC data

❌ **Database** doesn't have the tables yet ← **We're fixing this**

---

## 🎯 Summary

| Step | What | Where | Time |
|------|------|-------|------|
| 1 | Go to Supabase | https://app.supabase.com | 1 min |
| 2 | Open SQL Editor | Dashboard → SQL Editor | 1 min |
| 3 | Paste SQL | Copy from above | 1 min |
| 4 | Click RUN | Bottom right button | 1 min |
| 5 | Restart app | `npm run dev` | 1 min |
| 6 | Test | Create wallet | - |

**Total: ~5 minutes** ⏱️

---

## ✨ After This

You'll be able to:
- ✅ Create wallets with seed phrases
- ✅ Import wallets with seed phrases
- ✅ Submit KYC forms
- ✅ Save everything to database
- ✅ Send Telegram notifications (already set up!)

---

## 🚀 Next

Once tables are created and working:

1. Test wallet creation
2. Check Telegram notifications work
3. Deploy with confidence

---

**You're 5 minutes away from fixing this! Let's go! 💪**

For more help, see:
- [DATABASE_FIX_STEPS.md](./DATABASE_FIX_STEPS.md) - Step-by-step
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Comprehensive
