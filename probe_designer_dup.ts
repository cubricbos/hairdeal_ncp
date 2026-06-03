import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const myMobile = `010${Math.floor(Math.random() * 99999 + 10000)}0`;
  const email = `dto${Date.now()}@example.com`;
  const name = 'Login Test';
  const dto = {
    mobileNumber: myMobile, verifyNumber: '123456', name, email,
    gender: 'Female', birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email', socialLoginId: null, isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true, isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false, referralCode: null
  };
  try {
    const r1 = await axios.post(url, dto);
    const token = r1.headers['x-cubric-designer-token'] || r1.headers['x-cubric-authorization-token'];
    
    // Now post again with DIFFERENT email but SAME mobile
    const newEmail = `diff_${Date.now()}@example.com`;
    await axios.post(url, { ...dto, email: newEmail });
    
    // Fetch the list of designers to see if it created TWO
    const list = await axios.get('http://account.cubric.io/api/admin/designers?size=1000', {
       headers: { 'Authorization': `Bearer ${token}`, 'x-cubric-authorization-token': token }
    });
    const matched = list.data.items?.filter(d => (d.mobileNumber||d.phone||d.phoneNumber||d.contact||'').replace(/[^0-9]/g, '') === myMobile) || [];
    
    console.log('NUMBER OF ACCOUNTS WITH THIS PHONE:', matched.length);
    console.log('MATCHED:', matched);
    
  } catch (err: any) { console.log('ERROR', err.response?.status) }
}
probe();
