// Add this endpoint to server.ts
  app.post('/api/auth/ncp-token', async (req, res) => {
    try {
      const { payload } = req.body;
      if (!payload) return res.status(400).json({ error: 'Payload is required' });
      
      const { SignJWT } = require('jose');
      const secretStr = process.env.NCP_JWT_DESIGNER_SECRET_KEY || process.env.NCP_JWT_SECRET || '0cub6zbqmflr0ric1d';
      const secret = new TextEncoder().encode(secretStr);
      
      const ncpToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(secret);
        
      const ncpRefreshToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('14d')
        .sign(secret);
        
      res.json({ accessToken: ncpToken, refreshToken: ncpRefreshToken });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
