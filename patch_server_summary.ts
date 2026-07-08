import fs from 'fs';

const filePath = 'server.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const newEndpoint = `
  app.get('/api/admin/user-credit-summary', async (req, res) => {
    try {
      // 1. Verify admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (user.email !== 'cubric.ceo@gmail.com') {
        return res.status(403).json({ error: 'Not authorized as admin' });
      }

      // 2. Target designer ID
      const designerId = req.query.designerId as string;
      if (!designerId) return res.status(400).json({ error: 'Missing designerId' });

      // 3. Generate NCP token
      const secret = process.env.JWT_SECRET || '0cub6zbqmflr0ric1d';
      const designerPayload = {
        id: designerId,
        name: 'Admin Proxy',
        email: 'admin@cubric.io',
        mobileNumber: '01000000000'
      };
      const ncpToken = jwt.sign(designerPayload, secret, { algorithm: 'HS256', expiresIn: '1d' });

      // 4. Fetch from NCP Core Server
      const targetUrl = (process.env.CORE_SERVER_URL || 'http://hairdeal.cubric.io') + '/api/faceswap/credit';
      const ncpRes = await axios.get(targetUrl, {
        headers: {
          'Authorization': \`Bearer \${ncpToken}\`,
          'x-cubric-designer-token': ncpToken,
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return res.json(ncpRes.data);
    } catch (err: any) {
      return res.status(err.response?.status || 500).json({ error: 'Failed to fetch NCP credit summary', details: err.response?.data || err.message });
    }
  });
`;

if (!content.includes('/api/admin/user-credit-summary')) {
  content = content.replace("app.get('/api/admin/user-credit-history'", newEndpoint + "\n  app.get('/api/admin/user-credit-history'");
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Patched server.ts with /api/admin/user-credit-summary');
}
