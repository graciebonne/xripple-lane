# 📌 TABLE NOT FOUND - QUICK ANSWER

## Your Error
```
Could not find the table 'public.imported_wallets' in the schema cache
```

## The Fix
**Your database tables don't exist yet.** Copy the SQL below and run it in Supabase.

---

## 🚀 FIX IN 90 SECONDS

### Step 1: Go Here
https://app.supabase.com/project/heyaknwrcuskmwwefsiy/sql/new

### Step 2: Click "+ New Query"

### Step 3: Copy This SQL

```sql
-- Create all required tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, full_name TEXT, avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TYPE IF NOT EXISTS public.kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.kyc_status NOT NULL DEFAULT 'not_started',
  document_type TEXT, document_front_url TEXT, document_back_url TEXT, selfie_url TEXT,
  rejection_reason TEXT, submitted_at TIMESTAMP WITH TIME ZONE, reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  kyc_step INTEGER DEFAULT 1, ssn_encrypted TEXT, first_name TEXT, last_name TEXT,
  date_of_birth DATE, address_line1 TEXT, address_line2 TEXT, city TEXT, state TEXT,
  postal_code TEXT, country TEXT DEFAULT 'US', phone_number TEXT
);

CREATE TYPE IF NOT EXISTS public.wallet_type AS ENUM ('metamask', 'walletconnect', 'coinbase', 'phantom', 'tronlink', 'bitcoin');

CREATE TABLE IF NOT EXISTS public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_type public.wallet_type NOT NULL, wallet_address TEXT NOT NULL,
  chain_id TEXT, is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wallet_name TEXT, seed_hash TEXT, evm_address TEXT, solana_address TEXT, tron_address TEXT,
  UNIQUE(user_id, wallet_address)
);

CREATE TYPE IF NOT EXISTS public.transaction_type AS ENUM ('buy', 'swap', 'send', 'receive');
CREATE TYPE IF NOT EXISTS public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  source_chain TEXT, source_token TEXT, source_amount DECIMAL(20, 8),
  destination_chain TEXT DEFAULT 'XRP', destination_token TEXT DEFAULT 'XRP',
  destination_amount DECIMAL(20, 8), destination_address TEXT, tx_hash TEXT,
  fee_amount DECIMAL(20, 8), fee_currency TEXT, moonpay_transaction_id TEXT,
  fiat_currency TEXT, fiat_amount DECIMAL(20, 2), metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.imported_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, xrp_address TEXT NOT NULL, xrp_balance TEXT DEFAULT '0',
  evm_address TEXT, solana_address TEXT, tron_address TEXT, bitcoin_address TEXT,
  seed_hash TEXT, imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, xrp_address)
);

-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.imported_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own KYC" ON public.kyc_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own KYC" ON public.kyc_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own KYC" ON public.kyc_verifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own wallet connections" ON public.wallet_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own wallet connections" ON public.wallet_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own wallet connections" ON public.wallet_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own wallet connections" ON public.wallet_connections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own imported wallets" ON public.imported_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own imported wallets" ON public.imported_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own imported wallets" ON public.imported_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own imported wallets" ON public.imported_wallets FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_user_id ON public.imported_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_xrp_address ON public.imported_wallets(xrp_address);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.update_imported_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_imported_wallets_timestamp ON public.imported_wallets;
CREATE TRIGGER update_imported_wallets_timestamp
  BEFORE UPDATE ON public.imported_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imported_wallets_timestamp();
```

### Step 4: Click RUN

Bottom right corner → Blue "RUN" button

### Step 5: Restart App

```bash
npm run dev
```

---

## ✅ Done!

Go to `http://localhost:5173/dashboard/wallets` and test wallet creation.

It should work now! 🎉

---

## 📚 More Help

- [DATABASE_ERROR_FIX.md](./DATABASE_ERROR_FIX.md) - Full explanation
- [DATABASE_FIX_STEPS.md](./DATABASE_FIX_STEPS.md) - Step-by-step guide
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Detailed walkthrough
