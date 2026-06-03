
import axios from 'axios';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNiOGVmNzQwLThiZDItNDk1Yy1iYjk3LTdmN2U4NzYwMTE3YSIsImVtYWlsIjoiY3VicmljLmNlb0BnbWFpbC5jb20iLCJuYW1lIjoiRGVzaWduZXIiLCJuYW1lX2VuIjoiRGVzaWduZXIiLCJmdWxsX25hbWUiOiJEZXNpZ25lciIsImlhdCI6MTcxNzE5MjkyOCwiZXhwIjoxNzQ4NzI4OTI4fQ.7q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_q_w";

const targets = [
  'http://hairdeal.cubric.io',
  'http://account.cubric.io',
];

const paths = [
  '/api/designer/credit',
  '/api/designer/credit/summary',
  '/api/member/credit',
  '/api/face/credit',
  '/api/user/credit'
];

async function test() {
  for (const target of targets) {
    console.log(`\n=== Testing ${target} ===`);
    for (const path of paths) {
      try {
        const res = await axios.get(target + path, {
          headers: { 'x-cubric-designer-token': token }
        });
        console.log(`[${res.status}] GET ${path}`);
      } catch (err: any) {
        console.log(`[${err.response?.status || 'ERR'}] GET ${path}`);
      }
    }
  }
}

test();
