import http from 'http';

const data = JSON.stringify({
  customerKey: "test_customer_key",
  cardNumber: "4330123412341234",
  cardExpirationYear: "24",
  cardExpirationMonth: "08",
  cardPassword: "12",
  customerIdentityNumber: "881212"
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/toss/billing/authorizations/card',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log("RESPONSE BODY:", body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
