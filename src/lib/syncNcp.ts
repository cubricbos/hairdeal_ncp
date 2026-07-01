import axios from 'axios';
import { generateNcpToken } from './jwt';

export async function syncNcpProfile(user: any) {
  try {
    const rawEmail = user.email || `${user.id}@social.user`;
    const email = rawEmail.trim().toLowerCase();
    const name = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
    const rawPhone = user.user_metadata?.phone || '';
    
    let phone = rawPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('82')) phone = '0' + phone.substring(2);
    if (!phone) phone = '01000000000';

    let matchedDesignerId = '';

    // 1. Try to search NCP designers list
    try {
      const coreUrl = import.meta.env.VITE_CORE_SERVER_URL || '/api/designer';
      // Use proxy if it's relative, otherwise direct
      const listUrl = coreUrl.startsWith('/') ? coreUrl.replace('/api/designer', '/api/admin/designers?size=1000') : `${coreUrl}/api/admin/designers?size=1000`;
      
      const listRes = await axios.get(listUrl, { timeout: 8000 });
      const designers = listRes.data?.items || listRes.data || [];
      
      const found = designers.find((d: any) => {
        const ncpPhone = d.mobileNumber ? d.mobileNumber.replace(/[^0-9]/g, '') : '';
        const ncpEmail = d.email ? d.email.toLowerCase().trim() : '';
        return (email && ncpEmail === email) || (phone !== '01000000000' && ncpPhone === phone);
      });

      if (found) {
        matchedDesignerId = found.id;
        console.log(`[Frontend Sync] Matched existing NCP designer: ${matchedDesignerId}`);
      }
    } catch (err: any) {
      console.warn(`[Frontend Sync] Searching NCP designers failed:`, err.message);
    }

    // 2. If no matched designer, auto-register
    if (!matchedDesignerId) {
      console.log(`[Frontend Sync] Auto-registering new designer profile on NCP...`);
      try {
        const accountUrl = import.meta.env.VITE_ACCOUNT_SERVER_URL || '/api/account';
        const shopId = crypto.randomUUID().replace(/-/g, '');

        const registerPayload = {
          mobileNumber: phone,
          verifyNumber: "123456",
          name: name,
          email: email,
          gender: "Female",
          birthday: "1990-01-01T00:00:00Z",
          signedBy: "Social",
          socialLoginId: String(user.id),
          isServiceTermsAgreed: true,
          isPrivacyPolicyAgreed: true,
          isLocationServiceTermsAgreed: true,
          isMarketingTermsAgreed: false,
          referralCode: null,
          role: '디자이너',
          businessFile: null,
          businessTimes: [null, null, null, null, null, null, null],
          holidays: [],
          hairShop: {
            id: shopId,
            name: '미등록 매장',
            number: phone,
            sido: '', sigungu: '', bname: '', address: '', roadAddress: '',
            addressDetail: '미등록 매장 주소', zoneCode: '',
            location: { latitude: 0, longitude: 0 },
            businessNumber: '', 
            confirmedAt: new Date().toISOString(),
            rejectedAt: null, 
            rejectReason: null
          }
        };

        const createRes = await axios.post(`${accountUrl}/designer`, registerPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        console.log(`[Frontend Sync] Registered new NCP designer`);
      } catch (regErr: any) {
        console.error(`[Frontend Sync] Failed to register new NCP designer:`, regErr.response?.data || regErr.message);
      }
    }

    // 3. Generate tokens
    const cleanNcpId = matchedDesignerId || user.id.replace(/-/g, '');
    const ncpPayload = { id: cleanNcpId, name, email, mobileNumber: phone };
    const ncpToken = await generateNcpToken(ncpPayload, '1d');
    const ncpRefreshToken = await generateNcpToken(ncpPayload, '14d');

    localStorage.setItem('ncp_access_token', ncpToken);
    localStorage.setItem('ncp_refresh_token', ncpRefreshToken);
    window.dispatchEvent(new Event('ncp_auth_changed'));
    
    return true;
  } catch (e) {
    console.error("[Frontend Sync] Fatal error during NCP sync:", e);
    return false;
  }
}
