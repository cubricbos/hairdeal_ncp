global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
} as any;
import { accountClient } from './src/lib/ncpClient';

async function run() {
  try {
    const loginRes = await accountClient.post('/login', { mobileNumber: '01012345678', password: 'Password123!' });
    const token = loginRes.headers['x-cubric-designer-token'] || loginRes.headers['x-cubric-authorization-token'];
    console.log("Token:", !!token);

    accountClient.defaults.headers.common['x-cubric-designer-token'] = token;
    
    const detailRes = await accountClient.get('/designer/detail');
    console.log("Details before:", detailRes.data.name, detailRes.data.experienceYears);

    const updatePayload = {
      ...detailRes.data,
      name: "테스트이름" + Math.floor(Math.random() * 100),
      experienceYears: 7
    };

    console.log("Trying PUT /designer");
    try {
      const p = await accountClient.put('/designer', updatePayload);
      console.log("PUT Success:", p.status);
    } catch (e: any) { console.log("PUT failed:", e.response?.status); }

    const detailRes2 = await accountClient.get('/designer/detail');
    console.log("Details after:", detailRes2.data.name, detailRes2.data.experienceYears);

  } catch (err: any) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
run();
