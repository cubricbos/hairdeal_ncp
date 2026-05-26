-- Create an RPC to safely delete user accounts
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: allow if caller is the target user, OR if the caller is the site admin (cubric.ceo@gmail.com)
  IF auth.uid() = target_user_id OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'cubric.ceo@gmail.com' THEN
    -- Delete from public.profiles
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- Delete from auth.users (Will cascade to many auth things)
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to delete this user';
  END IF;
END;
$$;
