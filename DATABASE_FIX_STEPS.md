# 🎯 Database Fix - Step By Step

## The Error You're Getting
```
Could not find the table 'public.imported_wallets' in the schema cache
```

## What It Means
Your code is trying to save wallet data to the database, but **the table doesn't exist yet**.

---

## ✅ FIX IN 5 MINUTES

### Step 1: Open Supabase Dashboard
```
Go to: https://app.supabase.com
Login with your account
Click project: heyaknwrcuskmwwefsiy
```

### Step 2: Go to SQL Editor
```
Left sidebar → Click "SQL Editor"
Click blue "+ New Query" button
```

### Step 3: Copy & Paste This SQL

```sql
-- MIGRATION 1: Create core tables
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

-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wallet connections" ON public.wallet_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallet connections" ON public.wallet_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet connections" ON public.wallet_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallet connections" ON public.wallet_connections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
```

### Step 4: Click RUN
```
Bottom right corner → Click blue "RUN" button
Wait for success ✅
```

### Step 5: Run Second Query for Imported Wallets

Click **+ New Query** again and paste:

```sql
-- MIGRATION 5: Create imported_wallets table (THE CRITICAL ONE!) ⭐
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_imported_wallets_user_id ON public.imported_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_wallets_xrp_address ON public.imported_wallets(xrp_address);

-- Enable RLS
ALTER TABLE IF EXISTS public.imported_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own imported wallets" ON public.imported_wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own imported wallets" ON public.imported_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own imported wallets" ON public.imported_wallets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own imported wallets" ON public.imported_wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
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
```

### Step 6: Click RUN Again
```
Bottom right corner → Click blue "RUN" button
Wait for success ✅
```

---

## ✅ Verify Tables Were Created

### Check in Supabase Dashboard:
1. Left sidebar → **Database**
2. Click **Schemas** → **public**
3. You should see these tables:
   - ✅ `profiles`
   - ✅ `kyc_verifications`
   - ✅ `wallet_connections`
   - ✅ `transactions`
   - ✅ `imported_wallets` ⭐ **This is the one that was missing!**

---

## 🚀 Restart Your App

After migrations complete:

```bash
# Stop the dev server (press Ctrl+C)
npm run dev
```

Visit: `http://localhost:5173/dashboard/wallets`

Try creating or importing a wallet. **It should work now!** ✅

---

## 📋 What Each Query Does

| Query | Creates | Table Name |
|-------|---------|------------|
| Query 1 | User profiles | `profiles` |
| Query 1 | KYC verification data | `kyc_verifications` |
| Query 1 | External wallet connections | `wallet_connections` |
| Query 1 | Transaction history | `transactions` |
| Query 2 | **Imported seeds/wallets** ⭐ | `imported_wallets` |

---

## 🎉 That's It!

You're done! The tables now exist and your app can save wallet data.

**Time taken: 5 minutes** ⏱️

---

## 🆘 Common Issues

### I see "already exists" error
**This is fine!** Click through the error. It's from the `IF NOT EXISTS` clause in the SQL.

### Query times out
**No problem.** Click **Stop** and refresh the page. Try running just the second query (imported_wallets).

### Still getting "table not found" error in app
1. ✅ Verify all tables exist in Supabase Dashboard
2. ✅ Restart dev server: `npm run dev`
3. ✅ Hard refresh browser: `Ctrl+Shift+R`
4. ✅ Clear browser cache: `Ctrl+Shift+Delete`

### Can't access Supabase Dashboard
- Go to: https://app.supabase.com
- Click "Sign in"
- Use GitHub or Google to sign in

---

**Questions?** Check the complete guide: [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

---

**You've got this! 💪**
