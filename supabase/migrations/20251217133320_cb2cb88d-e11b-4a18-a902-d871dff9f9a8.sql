-- Allow any user to read their own admin profile (needed for auth checking)
CREATE POLICY "Users can view own admin profile"
ON admin_profiles FOR SELECT
USING (user_id = auth.uid());