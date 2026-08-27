const payload = {
  id: "d6bf71df962a4556a9f1cb53d8c57285",
  email: "cubric.ceo@gmail.com",
  name: "관리자 (System Admin)",
  mobileNumber: "010-1234-5678"
};
const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
const dummyToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.signature`;

const jwt = require('jsonwebtoken');
let decoded = jwt.decode(dummyToken);
console.log("jwt.decode:", decoded);

if (!decoded) {
  const payloadB64 = dummyToken.split('.')[1];
  const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
  try {
    console.log("fallback decode:", JSON.parse(payloadStr));
  } catch(e) {
    console.log("fallback error:", e);
  }
}
