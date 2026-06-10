/*
  # Create admin password verification RPC function

  This function allows secure password verification for admin login without
  exposing password hashes to the client.
*/

CREATE OR REPLACE FUNCTION verify_admin_password(p_username text, p_password text)
RETURNS TABLE(id uuid, username text, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.username, a.email, a.created_at
  FROM admins a
  WHERE a.username = p_username
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$;
