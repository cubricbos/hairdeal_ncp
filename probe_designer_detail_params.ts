import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const dto = {
    mobileNumber: `010${Math.floor(Math.random() * 89999999 + 10000000)}`,
    verifyNumber: '123456',
    name: 'Designer Parm Test',
    email: `designer_parm${Date.now()}@example.com`,
    gender: 'Female',
    birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email',
    socialLoginId: null,
    isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true,
    isLocationServiceTermsAgreed: true,
    isMarketingTermsAgreed: false,
    referralCode: null
  };

  try {
    const res = await axios.post(url, dto);
    const token = res.headers['x-cubric-authorization-token'];
    
    // Attempt detail with different params
    const tryParams = async (params) => {
        try {
            const detailRes = await axios.get('http://account.cubric.io/api/designer/detail', {
                headers: {
                    'x-cubric-authorization-token': token,
                    'Authorization': `Bearer ${token}`
                },
                params: params
            });
            console.log('DESIGNER DETAIL SUCCESS:', params, detailRes.status);
        } catch(e: any) {
            console.log('DESIGNER DETAIL FAIL:', params, e.response?.status);
        }
    }
    
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const id = tokenPayload.id;

    await tryParams({ id: id });
    await tryParams({ userId: id });
    await tryParams({ email: dto.email });
    await tryParams({ mobileNumber: dto.mobileNumber });
  } catch (err: any) {
    console.log('DESIGNER CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
