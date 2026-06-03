const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjljYmY3YmQxM2U0ZTRiNzE5MjMzZmRkNmU2MzA4NWQxIiwiaWF0IjoxNzgwMTk1NTYwLCJleHAiOjE3ODAyODE5NjB9.87Ebo8nGgSZEc6RPux1nZO3dtaqO001kERMQCOMHqz8';
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
console.log(payload);
