-- Update RLS policies to allow approval page to work
-- The approval page should be accessible without login (via Telegram link)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can insert their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can update their own KYC" ON public.kyc_verifications;

-- Create new open policies for approval workflow
-- Anyone (auth or anon) can view KYC by user_id for approval
CREATE POLICY "Public KYC approval access" ON public.kyc_verifications
  FOR SELECT
  USING (true);

-- Anyone (auth or anon) can update KYC status for approval/reject
CREATE POLICY "Public KYC approval updates" ON public.kyc_verifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Users can insert their own KYC record
CREATE POLICY "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
