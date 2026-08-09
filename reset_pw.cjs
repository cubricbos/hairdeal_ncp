const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  console.log("Fetching user...");
  const { data: users, error: selectErr } = await supabase.auth.admin.listUsers();
  if (selectErr) {
    console.log("Error listing users:", selectErr);
    return;
  }
  
  const user = users.users.find(u => u.email === 'cubric.ceo@gmail.com');
  if (user) {
    console.log("Found user, updating password...");
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'cubric_default_password_1!'
    });
    if (error) console.log("Update error:", error);
    else console.log("Success! Password reset.");
  } else {
    console.log("Admin user not found in auth.");
  }
}

run();
