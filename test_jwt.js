import jwt from 'jsonwebtoken';
import * as jose from 'jose';

async function run() {
  const payload = { id: "123", email: "test" };
  const secret = '0cub6zbqmflr0ric1d';
  const dummyToken = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret));
  console.log("Token:", dummyToken);
  
  try {
    const decoded = jwt.verify(dummyToken, secret);
    console.log("Decoded:", decoded);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
