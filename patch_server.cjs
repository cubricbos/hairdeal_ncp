const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
  // Proxy endpoint to fetch site settings, bypassing Supabase CORS rules in the browser
  app.get('/api/site-settings', async (req, res) => {
    try {
      const client = getSupabaseAdmin() || supabase;
      if (!client) {
        return res.status(500).json({ error: 'Supabase client not initialized' });
      }
      const { data, error } = await client
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure endpoint to update site settings`;

content = content.replace('  // Secure endpoint to update site settings', newEndpoint);

fs.writeFileSync(file, content);
console.log('patched server.ts');
