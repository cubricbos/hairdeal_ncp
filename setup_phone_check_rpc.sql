-- Check if phone exists
CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  phone_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'phone' = p_phone
  ) INTO phone_exists;
  
  RETURN phone_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
