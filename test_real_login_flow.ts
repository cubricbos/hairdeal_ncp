import axios from 'axios';

async function run() {
  const phone = '01049990044'; // 이현우 phone number
  
  console.log(`Attempting real login for phone ${phone}...`);
  let token = '';
  try {
    const loginRes = await axios.post('http://account.cubric.io/api/designer/login/mobile', {
      mobileNumber: phone,
      verifyNumber: '111111'
    });
    
    console.log("Login Status:", loginRes.status);
    token = loginRes.data?.accessToken || loginRes.data?.token || loginRes.headers['x-cubric-designer-token'] || '';
    if (!token && loginRes.headers.authorization) {
      token = loginRes.headers.authorization.replace('Bearer ', '');
    }
    
    if (!token && loginRes.data?.data_response?.accessToken) {
      token = loginRes.data.data_response.accessToken;
    }
    
    if (!token && loginRes.data?.data?.accessToken) {
      token = loginRes.data.data.accessToken;
    }
    
    console.log("Success! Token received:", token);
  } catch (e: any) {
    console.error("Login failed:", e.message, e.response?.data);
    return;
  }

  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-cubric-designer-token': token,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }
  });

  // Get current state from Core
  console.log("Fetching current designer info from core...");
  let designer: any = null;
  try {
    const detailRes = await client.get('/admin/designer', { params: { designerId: 'e328fcf2daa441c3a2a9ac206e0d9e0f' } });
    designer = detailRes.data;
    console.log("Current hairShop on core:", JSON.stringify(designer.hairShop, null, 2));
  } catch (e: any) {
    console.warn("Failed to get detail from core:", e.message, e.response?.data);
  }

  // Set up update payload
  const payload = {
    shopName: "아이데 관악점",
    shopNumber: "02-755-0022",
    addressDetail: "1123-433",
    address: {
      sido: "서울",
      sigungu: "금천구",
      bname: "가산동",
      address: "서울 금천구 가마산로 72",
      roadAddress: "서울 금천구 가마산로 72",
      zoneCode: "08500",
      location: {
        latitude: 37.4849,
        longitude: 126.8745
      }
    },
    businessTimes: null,
    holidays: null
  };

  try {
    console.log("\nSending update payload to /designer/management on real core server...");
    const res = await client.post('/designer/management', payload);
    console.log("UPDATE SUCCESS! Status:", res.status);
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.error("UPDATE FAIL:", e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}

run();
