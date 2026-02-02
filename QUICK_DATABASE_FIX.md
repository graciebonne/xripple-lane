# ⚡ QUICK FIX - Create Tables Now

## Your Problem
```
Could not find the table 'public.imported_wallets' in the schema cache
```

## Root Cause
**The database table doesn't exist yet.** The migration files exist in your project but haven't been executed in your Supabase database.

---

## 🚀 FASTEST SOLUTION (2 minutes)

### Option A: Auto-Run All Migrations

Run this single command to create all tables:

```bash
cd /workspaces/ripple-lane

# Copy all migration files into one file and display
cat > /tmp/all_migrations.sql << 'MIGRATIONS'

-- =============================================
-- MIGRATION 1: Core tables (profiles, KYC, wallets, transactions)
-- =============================================

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

-- =============================================
-- MIGRATION 5: Imported wallets (THE CRITICAL ONE!) ⭐
-- =============================================

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

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_user_id ON public.imported_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_xrp_address ON public.imported_wallets(xrp_address);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.imported_wallets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- KYC policies
DROP POLICY IF EXISTS "Users can view their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can insert their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can update their own KYC" ON public.kyc_verifications;

CREATE POLICY "Users can view their own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallet connections policies
DROP POLICY IF EXISTS "Users can view their own wallet connections" ON public.wallet_connections;
DROP POLICY IF EXISTS "Users can insert their own wallet connections" ON public.wallet_connections;
DROP POLICY IF EXISTS "Users can update their own wallet connections" ON public.wallet_connections;
DROP POLICY IF EXISTS "Users can delete their own wallet connections" ON public.wallet_connections;

CREATE POLICY "Users can view their own wallet connections" ON public.wallet_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallet connections" ON public.wallet_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet connections" ON public.wallet_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallet connections" ON public.wallet_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Imported wallets policies ⭐ CRITICAL
DROP POLICY IF EXISTS "Users can view their own imported wallets" ON public.imported_wallets;
DROP POLICY IF EXISTS "Users can insert their own imported wallets" ON public.imported_wallets;
DROP POLICY IF EXISTS "Users can update their own imported wallets" ON public.imported_wallets;
DROP POLICY IF EXISTS "Users can delete their own imported wallets" ON public.imported_wallets;

CREATE POLICY "Users can view their own imported wallets" ON public.imported_wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own imported wallets" ON public.imported_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own imported wallets" ON public.imported_wallets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own imported wallets" ON public.imported_wallets
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

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

-- =============================================
-- DONE! All tables created
-- =============================================
MIGRATIONS

echo "✅ All migrations compiled!"
cat /tmp/all_migrations.sql
```

### Then, Run via Supabase:

1. Go to: [https://app.supabase.com/project/heyaknwrcuskmwwefsiy/sql/new](https://app.supabase.com/project/heyaknwrcuskmwwefsiy/sql/new)
2. Open SQL Editor → New Query
3. Copy the command above and paste all SQL
4. Click **RUN**

---

## Option B: Manual - Copy & Paste Each File

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `heyaknwrcuskmwwefsiy`
3. Click **SQL Editor** → **New Query**
4. For each migration file below, paste the contents and click RUN:

### Migration 1 (Core Tables)
📄 File: `supabase/migrations/20260121085736_2172fe85-b0cc-45bd-86c0-dd77bf849e43.sql`

### Migration 2 (Storage)
📄 File: `supabase/migrations/20260122133628_aa91727b-84f1-4c88-8173-9a4165f6394b.sql`

### Migration 3 (KYC Auto-Approve)
📄 File: `supabase/migrations/20260122195204_1c8e3333-0a6c-4cf4-b67e-7bf695c00f57.sql`

### Migration 4 (Wallet Fields)
📄 File: `supabase/migrations/20260201165531_d6407ceb-92c5-4753-8d1b-50da17b627fc.sql`

### Migration 5 (Imported Wallets) ⭐ CRITICAL
📄 File: `supabase/migrations/20260202_imported_wallets.sql`

---

## ✅ Verify It Worked

After running the migrations:

### Check Tables Exist
In Supabase Dashboard → **Database** → **Schemas** → **public**

You should see:
- ✅ `profiles`
- ✅ `kyc_verifications`
- ✅ `wallet_connections`
- ✅ `transactions`
- ✅ `imported_wallets` ⭐ **This is the critical one!**

### Quick Test Query
Run this in SQL Editor:
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'imported_wallets' 
  AND table_schema = 'public'
);
```

Should return: `true`

---

## 🔄 Restart App

After migrations complete:

```bash
npm run dev
```

Then:
1. Go to `/dashboard/wallets`
2. Try creating or importing a wallet
3. **It should work now!** ✅

---

## 📌 Summary

| Step | Time | Action |
|------|------|--------|
| 1 | 1 min | Go to Supabase Dashboard |
| 2 | 1 min | Open SQL Editor |
| 3 | 1 min | Paste all migration SQL |
| 4 | 1 min | Click RUN |
| 5 | - | Done! Restart app |

**Total: 5 minutes to fix** ⏱️

---

## 🆘 Issues?

### "Relation does not exist"
You missed running one of the migrations. Go back and run all 5.

### "Already exists" 
Just a warning - it's fine, continue.

### Still getting the error in app
- ✅ Verify migrations ran (check Schemas)
- ✅ Restart dev server: `npm run dev`
- ✅ Hard refresh browser: `Ctrl+Shift+R`
- ✅ Clear localStorage: DevTools → Application → LocalStorage → Delete

### Can't log in to Supabase
Use your GitHub credentials or Google to sign in

---

## 🎯 You're 5 minutes away from fixing this!

Just copy the SQL, paste it into Supabase, click RUN, and restart your app. 🚀
