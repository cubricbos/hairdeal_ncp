import { SignJWT } from 'jose';

export async function generateNcpToken(payload: any, expiresIn: string = '1d'): Promise<string> {
  const secretStr = import.meta.env.VITE_NCP_JWT_DESIGNER_SECRET_KEY || '0cub6zbqmflr0ric1d';
  const secret = new TextEncoder().encode(secretStr);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
    
  return token;
}
