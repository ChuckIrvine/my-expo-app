import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  let action, userId;
  try {
    const body = await req.json();
    action = body.action;
    userId = body.userId;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400 }
    );
  }

  const API_URL = Deno.env.get('API_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');

  // Log the first 10 characters of the SERVICE_ROLE_KEY for debugging
  console.log('SERVICE_ROLE_KEY (first 10 chars):', SERVICE_ROLE_KEY ? SERVICE_ROLE_KEY.substring(0, 10) : 'undefined');

  if (!API_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing API_URL or SERVICE_ROLE_KEY' }),
      { status: 500 }
    );
  }

  const supabase = createClient(API_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    if (action === 'list') {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.log('Error fetching users:', error.message);
        throw new Error(error.message);
      }
      console.log('Users fetched:', data.users);
      return new Response(
        JSON.stringify({ users: data.users || [] }),
        { status: 200 }
      );
    } else if (action === 'delete' && userId) {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.log('Error deleting user:', error.message);
        throw new Error(error.message);
      }
      console.log(`User deleted: ${userId}`);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "list" or "delete".' }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.log('Error in manage-users function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});