const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const metricsEndpoints = `
  app.get('/api/app-metrics', async (req, res) => {
    try {
      const admin = getSupabaseAdmin();
      if (!admin) return res.status(500).json({ error: 'No admin client' });
      const { data, error } = await admin.from('app_metrics').select('*').eq('id', 1).single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/app-metrics/increment', async (req, res) => {
    try {
      const admin = getSupabaseAdmin();
      if (!admin) return res.status(500).json({ error: 'No admin client' });
      const { data, error } = await admin.rpc('increment_page_visit');
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/visitor_logs', handleGetVisitorLogs);
`;

content = content.replace("  app.get('/api/visitor_logs', handleGetVisitorLogs);", metricsEndpoints);

fs.writeFileSync(file, content);
console.log('patched server.ts with metrics');
