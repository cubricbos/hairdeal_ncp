import axios from 'axios';

async function testSave() {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjljYmY3YmQxM2U0ZTRiNzE5MjMzZmRkNmU2MzA4NWQxIiwiaWF0IjoxNzgwMTk1NTYwLCJleHAiOjE3ODAyODE5NjB9.87Ebo8nGgSZEc6RPux1nZO3dtaqO001kERMQCOMHqz8';
  const baseURL = 'http://hairdeal.cubric.io/api';
  
  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const baseAddress = {
    sido: "서울",
    sigungu: "강남구",
    bname: "역삼동",
    address: "서울 강남구 역삼동 123",
    roadAddress: "서울 강남구 역삼로 123",
    zonecode: "12345",
    latitude: 37.5,
    longitude: 127.0
  };

  const testPayloads = [
    {
      name: "5. Payload with businessTimes: null and holidays: null",
      data: {
        shopName: "테스트샵",
        shopNumber: "01012345678",
        addressDetail: "1층",
        address: baseAddress,
        businessTimes: null,
        holidays: null
      }
    },
    {
      name: "6. Payload with businessTimes omitted and holidays omitted",
      data: {
        shopName: "테스트샵",
        shopNumber: "01012345678",
        addressDetail: "1층",
        address: baseAddress
      }
    },
    {
      name: "7. Payload with empty arrays",
      data: {
        shopName: "테스트샵",
        shopNumber: "01012345678",
        addressDetail: "1층",
        address: baseAddress,
        businessTimes: [],
        holidays: []
      }
    }
  ];

  for (const t of testPayloads) {
    try {
      console.log(`\n--- Testing: ${t.name} ---`);
      const res = await client.post('/designer/management', t.data);
      console.log('SUCCESS status:', res.status, JSON.stringify(res.data));
    } catch (e: any) {
      console.log('FAILED status:', e.response?.status);
      console.log('Response body:', JSON.stringify(e.response?.data, null, 2));
    }
  }
}

testSave();
