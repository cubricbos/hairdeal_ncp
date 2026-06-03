import dotenv from 'dotenv';
dotenv.config();

console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", process.env.VITE_SUPABASE_ANON_KEY);
console.log("VITE_SUPABASE_PUBLIC_TK:", process.env.VITE_SUPABASE_PUBLIC_TK);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");
console.log("VITE_SUPABASE_SERVICE_ROLE_KEY:", process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");
