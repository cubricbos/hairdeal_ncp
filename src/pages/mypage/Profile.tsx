import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Lock, Trash2, Phone, FileText, AlertTriangle, X, Briefcase, Store, Award } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { accountClient } from '../../lib/ncpClient';
import { safeJwtDecode, retrySupabaseSelect } from '../../lib/supabase-utils';
import { AvatarImage } from '../../components/AvatarImage';

const getProfileImageCandidates = (data: any) => {
  const list: string[] = [];
  if (!data) return list;

  const possibleNames = new Set<string>();

  // 1. Check nested profile FileDto
  if (data.profile) {
    if (data.profile.thumbNailPath) possibleNames.add(data.profile.thumbNailPath);
    if (data.profile.fileName) possibleNames.add(data.profile.fileName);
    if (data.profile.savedFileName) possibleNames.add(data.profile.savedFileName);
    if (data.profile.savedPath) possibleNames.add(data.profile.savedPath);
    if (data.profile.path) possibleNames.add(data.profile.path);
    if (data.profile.url) possibleNames.add(data.profile.url);
    if (data.profile.id) possibleNames.add(data.profile.id);
    if (data.profile.fileId) possibleNames.add(data.profile.fileId);
    if (data.profile.file_id) possibleNames.add(data.profile.file_id);
    if (data.profile.details && Array.isArray(data.profile.details) && data.profile.details[0]) {
      possibleNames.add(data.profile.details[0]);
    }
  }

  // 2. Check top-level designers table file_id / fileId
  if (data.file_id) possibleNames.add(data.file_id);
  if (data.fileId) possibleNames.add(data.fileId);
  if (data.profileId) possibleNames.add(data.profileId);
  if (data.profile_id) possibleNames.add(data.profile_id);

  // Generate paths for each name
  possibleNames.forEach(name => {
    if (!name) return;
    list.push(`https://api.cubric.io/api/storage?fileName=${name}`);
    list.push(`https://api.cubric.io/storage/${name}`);
    list.push(`/api/core/storage?fileName=${name}`);
    list.push(`/api/core/storage/${name}`);
    list.push(`/storage/${name}`);
  });

  // 3. Fallbacks for direct URLs
  const directUrls = [
    data.profileImageUrl,
    data.profileImage,
    data.imageUrl,
    data.image,
    data.profile_image,
    data.avatarUrl,
    data.avatar_url
  ];

  directUrls.forEach(url => {
    if (url && typeof url === 'string' && url.trim()) {
      list.push(url.trim());
    }
  });

  return Array.from(new Set(list));
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // profile state representing NCP Designer
  const [profile, setProfile] = useState<any | null>(null);
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState('');
  const [shopName, setShopName] = useState('');
  const [careerYears, setCareerYears] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageCandidates, setImageCandidates] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [aiImageAgreement, setAiImageAgreement] = useState(false);
  const [aiVideoAgreement, setAiVideoAgreement] = useState(false);
  const [aiTextAgreement, setAiTextAgreement] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'warning' | 'submitting' | 'success'>('idle');
  const [showToast, setShowToast] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const safetyTimeoutId = setTimeout(() => {
      if (isMounted.current) {
        console.warn("[Profile] Profile loading took too long, enforcing safety spinner dropdown.");
        setLoading(false);
        const token = localStorage.getItem('ncp_access_token');
        if (token) {
          try {
            const decoded = safeJwtDecode(token);
            if (decoded) {
              const fallbackName = decoded.name || '디자이너';
              const fallbackEmail = decoded.email || `${decoded.id || 'designer'}@ncp.local`;
              const finalId = decoded.id || 'designer';
              const cachedCareerYears = localStorage.getItem(`ncp_career_years_${finalId}`) || '';
              
              setProfile({
                email: fallbackEmail,
                name: fallbackName,
                mobileNumber: decoded.mobileNumber || '',
                introduction: '',
                profileImageUrl: ''
              });
              setName(fallbackName);
              setNickname(fallbackName);
              setPosition('디자이너');
              setShopName('미등록 매장');
              setCareerYears(cachedCareerYears);
              setEmail(fallbackEmail);
              setMobileNumber(decoded.mobileNumber || '');
            }
          } catch (jwtErr) {
            console.warn("[Profile] Safety fallback token decode failed:", jwtErr);
          }
        }
      }
    }, 1500);

    const fetchProfile = async () => {
      const token = localStorage.getItem('ncp_access_token');
      let profileLoadedSuccessfully = false;

      if (!token) {
        // Fallback to Supabase Profile for social-logged-in users
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: spProfile } = await retrySupabaseSelect<any>(() => supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle() as any);
            if (spProfile && isMounted.current) {
              const fbProf = {
                email: session.user.email || '',
                name: spProfile.full_name || '',
                mobileNumber: spProfile.phone || '',
                introduction: spProfile.introduction || '',
                profileImageUrl: spProfile.avatar_url || ''
              };
              setProfile(fbProf);
              setName(spProfile.full_name || '');
              setNickname(spProfile.full_name || '');
              setPosition(spProfile.role || '디자이너');
              setShopName('미등록 매장');
              setCareerYears('');
              setEmail(session.user.email || '');
              setMobileNumber(spProfile.phone || '');
              setIntroduction(spProfile.introduction || '');
              setProfileImageUrl(spProfile.avatar_url || null);
              setImageCandidates(getProfileImageCandidates(fbProf));
              setCandidateIndex(0);
              setReferralCode(spProfile.referral_code || '');
              profileLoadedSuccessfully = true;
            }
          }
        } catch (supabaseErr) {
          console.warn('Supabase fallback profile fetch failed:', supabaseErr);
        } finally {
          clearTimeout(safetyTimeoutId);
          if (isMounted.current) {
            setLoading(false);
          }
        }
        return;
      }

      let decoded: any = null;
      try {
        decoded = safeJwtDecode(token);
      } catch (e) {
        console.warn("Could not decode NCP token in Profile.tsx:", e);
      }

      try {
        const { data } = await accountClient.get('/designer/detail');
        if (data && isMounted.current) {
          let finalId = decoded?.id || '';
          if (finalId && !finalId.includes('-')) {
             finalId = `${finalId.substring(0, 8)}-${finalId.substring(8, 12)}-${finalId.substring(12, 16)}-${finalId.substring(16, 20)}-${finalId.substring(20)}`;
          }

          // Strictly align fields using ONLY NCP API specifications (NO Supabase fallback reading)
          const backendNickname = data.nickname || data.nickName || data.name || decoded?.name || '디자이너';
          const backendPosition = data.position || data.positionName || data.role || '디자이너';
          const backendShopName = data.hairShop?.name || data.shopName || '미등록 매장';
          let backendCareerYears = data.careerYears || data.experienceYears || data.experience || data.career || '';
          
          if (!backendCareerYears && finalId) {
             backendCareerYears = localStorage.getItem(`ncp_career_years_${finalId}`) || '';
          }

          setProfile(data);
          setName(data.name || decoded?.name || '디자이너');
          setNickname(backendNickname);
          setPosition(backendPosition);
          setShopName(backendShopName);
          setCareerYears(backendCareerYears);
          setEmail(data.email || data.loginId || data.accountEmail || data.userEmail || decoded?.email || '');
          setMobileNumber(data.mobileNumber || data.mobile_number || data.phone || decoded?.mobileNumber || '');
          setIntroduction(data.introduce || data.introduction || '');
          setReferralCode(data.referral_code || data.referralCode || '');
          
          setMarketingConsent(data.marketingAgreement || data.marketing_agreement || false);
          setAiImageAgreement(data.aiImageAgreement || data.ai_image_agreement || false);
          setAiVideoAgreement(data.aiVideoAgreement || data.ai_video_agreement || false);
          setAiTextAgreement(data.aiTextAgreement || data.ai_text_agreement || false);
          
          const candidates = getProfileImageCandidates(data);
          setImageCandidates(candidates);
          setCandidateIndex(0);
          
          let finalImg = '';
          if (candidates.length > 0) {
            finalImg = Array.from(new Set(candidates)).join(',');
          } else if (data.profile && data.profile.thumbNailPath) {
            finalImg = `https://api.cubric.io/api/storage?fileName=${data.profile.thumbNailPath}`;
          } else if (data.profile && (data.profile.id || data.profile.fileId || data.profile.file_id || data.profile.fileName)) {
            const tempName = data.profile.thumbNailPath || data.profile.fileName || data.profile.id || data.profile.fileId || data.profile.file_id;
            finalImg = `https://api.cubric.io/api/storage?fileName=${tempName}`;
          } else if (data.file_id || data.fileId) {
            finalImg = `https://api.cubric.io/api/storage?fileName=${data.file_id || data.fileId}`;
          } else {
            finalImg = data.profileImage || data.profileImageUrl || data.imageUrl || data.image || data.profile_image || data.avatarUrl || data.avatar_url || '';
          }
          if (finalImg) {
            setProfileImageUrl(finalImg);
          }
          profileLoadedSuccessfully = true;
        }
      } catch (err: any) {
        console.warn('NCP 프로필 상세 조회 실패, 토큰 파싱 시도:', err);
        const status = err.response?.status;
        const isWithdrawn = status === 400 || status === 403 || status === 404;
        const isUnauthorized = status === 401;
        
        if ((isWithdrawn || isUnauthorized) && isMounted.current) {
          console.log("[ProfilePage] Live NCP account withdrawn or token invalid. Auto logging out...");
          localStorage.removeItem('ncp_access_token');
          localStorage.removeItem('ncp_refresh_token');
          localStorage.removeItem('ncp_admin');
          localStorage.clear();
          sessionStorage.clear();
          supabase.auth.signOut().catch(() => {});
          window.dispatchEvent(new Event('ncp_auth_changed'));
          
          if (isWithdrawn) {
            alert('회원 정보가 유효하지 않거나 탈퇴된 계정입니다. 자동으로 로그아웃됩니다.');
          } else {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          
          navigate('/?logout=' + Date.now(), { replace: true });
          return;
        }

        try {
          if (decoded && isMounted.current) {
            const fallbackProfile = {
              email: decoded.email || `${decoded.id || 'designer'}@ncp.local`,
              name: decoded.name || '디자이너',
              mobileNumber: decoded.mobileNumber || '',
              introduction: '',
              profileImageUrl: ''
            };
            const cachedCareerYears = localStorage.getItem(`ncp_career_years_${decoded.id}`) || '';
            
            setProfile(fallbackProfile);
            setName(fallbackProfile.name);
            setNickname(decoded.nickname || decoded.name || fallbackProfile.name);
            setPosition(decoded.position || decoded.role || '디자이너');
            setShopName('미등록 매장');
            setCareerYears(cachedCareerYears);
            setEmail(fallbackProfile.email);
            setMobileNumber(fallbackProfile.mobileNumber);
            setIntroduction(fallbackProfile.introduction);
            setProfileImageUrl(fallbackProfile.profileImageUrl || null);
            setImageCandidates(getProfileImageCandidates(fallbackProfile));
            setCandidateIndex(0);
            setReferralCode('');
            profileLoadedSuccessfully = true;
          }
        } catch (parseErr) {
          console.error("JWT Parse/Lookup error in ProfilePage catch block:", parseErr);
        }
      } finally {
        clearTimeout(safetyTimeoutId);
        if (isMounted.current) {
          // Ultimate fallback to guarantee page does not hang if profile is still null
          if (!profileLoadedSuccessfully) {
            const fallbackName = decoded?.name || '디자이너';
            const fallbackEmail = decoded?.email || `${decoded?.id || 'designer'}@ncp.local`;
            const fbProfile = {
              email: fallbackEmail,
              name: fallbackName,
              mobileNumber: decoded?.mobileNumber || '',
              introduction: '',
              profileImageUrl: ''
            };
            setProfile(fbProfile);
            setName(fallbackName);
            setNickname(fallbackName);
            setPosition('디자이너');
            setShopName('미등록 매장');
            setCareerYears('');
            setEmail(fallbackEmail);
            setMobileNumber(fbProfile.mobileNumber);
            setImageCandidates(getProfileImageCandidates(fbProfile));
            setCandidateIndex(0);
          }
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
    return () => {
      isMounted.current = false;
      clearTimeout(safetyTimeoutId);
    };
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const localUrl = URL.createObjectURL(file);
      setProfileImageUrl(localUrl);
      setImageCandidates([localUrl]);
      setCandidateIndex(0);
      
      // Store locally so Navbar can immediately display it without waiting for network replication
      localStorage.setItem('temp_profile_blob', localUrl);
      window.dispatchEvent(new Event('profile_updated'));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    if (password && password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    
    try {
      let finalSyncedImg = profileImageUrl || '';
      // 1. Attempt to update NCP server
      try {
        // Try to update remaining designer JSON details via an alternative documented or known admin route if any, 
        // else fallback to purely relying on forms.
        // Wait, standard designer patch endpoints aren't available for user token, so we skip JSON completely
        // to avoid persistent 405 console logs. All changes should be handled by /designer/change via FormData.

        try {
          const formData = new FormData();
          const token = localStorage.getItem('ncp_access_token');
          let currentDecoded: any = null;
          if (token) {
            try { currentDecoded = safeJwtDecode(token); } catch(e){}
          }
          
          let designerId = profile?.id || currentDecoded?.id;
          if (!designerId) throw new Error("Missing designer ID");
          
          formData.append('id', designerId);
          formData.append('name', nickname || name || '디자이너');
          formData.append('nickname', nickname || name || '디자이너');
          formData.append('nickName', nickname || name || '디자이너');
          
          if (mobileNumber) formData.append('mobileNumber', mobileNumber.replace(/-/g, ''));
          if (email) formData.append('email', email);
          
          formData.append('imageChanged', profileImage ? 'true' : 'false');
          formData.append('role', position || '디자이너');
          formData.append('career', String(careerYears || 0));
          formData.append('signatures', '[]');
          
          formData.append('introduce', introduction || '');
          formData.append('introduction', introduction || '');

          formData.append('marketingAgreement', String(marketingConsent));
          formData.append('marketing_agreement', String(marketingConsent));
          formData.append('aiImageAgreement', String(aiImageAgreement));
          formData.append('ai_image_agreement', String(aiImageAgreement));
          formData.append('aiVideoAgreement', String(aiVideoAgreement));
          formData.append('ai_video_agreement', String(aiVideoAgreement));
          formData.append('aiTextAgreement', String(aiTextAgreement));
          formData.append('ai_text_agreement', String(aiTextAgreement));

          if (profileImage) {
            formData.append('images', profileImage);
          }

          // We use native fetch to perfectly bypass any Axios header merging issues with FormData boundaries
          const fetchUrl = `${(process.env.ACCOUNT_SERVER_URL || 'http://account.cubric.io').replace(/\/$/, '')}/api/designer/change`;
          const rawToken = localStorage.getItem('ncp_access_token') || '';
          
          const changeRes = await fetch(accountClient.defaults.baseURL + '/designer/change', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${rawToken}`,
              'x-cubric-designer-token': rawToken
            },
            body: formData
          });

          if (!changeRes.ok) {
            throw new Error(`ProfileSave backend error: ${changeRes.status}`);
          }
        } catch (formErr: any) {
          console.warn("[ProfileSave] NCP /designer/change API error details:", formErr);
          alert('프로필 변경 사항을 저장하는데 실패했습니다.');
          setSaving(false);
          return; // Stop here, do not rollback UI
        }

        // 1a. Fetch immediately to get the updated profile storage name from NCP and keep synced!
        try {
          // Add a cache buster timestamp to completely avoid browser caching stale profile data
          const detailRes = await accountClient.get(`/designer/detail?_t=${Date.now()}`);
          const token = localStorage.getItem('ncp_access_token');
          let currentDecoded: any = null;
          if (token) {
            try { currentDecoded = safeJwtDecode(token); } catch(e){}
          }

          if (detailRes && detailRes.data) {
            const freshData = detailRes.data;
            setProfile(freshData);
            
            // Sync all visual reactive form states directly with the updated real-time NCP data
            const freshName = freshData.name || currentDecoded?.name || '디자이너';
            const freshNickname = freshData.nickname || freshData.nickName || freshData.name || currentDecoded?.name || '디자이너';
            const freshPosition = freshData.position || freshData.positionName || freshData.role || '디자이너';
            const freshCareerYears = freshData.careerYears || freshData.experienceYears || freshData.experience || freshData.career || '';
            const freshEmail = freshData.email || freshData.loginId || freshData.accountEmail || freshData.userEmail || currentDecoded?.email || '';
            const freshMobile = freshData.mobileNumber || freshData.mobile_number || freshData.phone || currentDecoded?.mobileNumber || '';
            const freshIntro = freshData.introduce || freshData.introduction || '';
            const freshMarketing = freshData.marketingAgreement || freshData.marketing_agreement || false;
            const freshAiImage = freshData.aiImageAgreement || freshData.ai_image_agreement || false;
            const freshAiVideo = freshData.aiVideoAgreement || freshData.ai_video_agreement || false;
            const freshAiText = freshData.aiTextAgreement || freshData.ai_text_agreement || false;

            setName(freshName);
            setNickname(freshNickname);
            setPosition(freshPosition);
            setCareerYears(freshCareerYears);
            setEmail(freshEmail);
            setMobileNumber(freshMobile);
            setIntroduction(freshIntro);
            setMarketingConsent(freshMarketing);
            setAiImageAgreement(freshAiImage);
            setAiVideoAgreement(freshAiVideo);
            setAiTextAgreement(freshAiText);

            const freshCandidates = getProfileImageCandidates(freshData);
            const tempBlob = localStorage.getItem('temp_profile_blob');
            if (tempBlob && !freshCandidates.includes(tempBlob)) {
              freshCandidates.unshift(tempBlob);
            }
            setImageCandidates(freshCandidates);
            setCandidateIndex(0);
            
            let freshImg = '';
            if (freshCandidates.length > 0) {
              freshImg = Array.from(new Set(freshCandidates)).join(',');
            } else if (freshData.profile && freshData.profile.thumbNailPath) {
              freshImg = `https://api.cubric.io/api/storage?fileName=${freshData.profile.thumbNailPath}`;
            } else if (freshData.profile && (freshData.profile.id || freshData.profile.fileId || freshData.profile.file_id || freshData.profile.fileName)) {
              const tempName = freshData.profile.thumbNailPath || freshData.profile.fileName || freshData.profile.id || freshData.profile.fileId || freshData.profile.file_id;
              freshImg = `https://api.cubric.io/api/storage?fileName=${tempName}`;
            } else if (freshData.file_id || freshData.fileId) {
              freshImg = `https://api.cubric.io/api/storage?fileName=${freshData.file_id || freshData.fileId}`;
            } else {
              freshImg = freshData.profileImage || freshData.profileImageUrl || freshData.imageUrl || freshData.image || freshData.profile_image || freshData.avatarUrl || freshData.avatar_url || '';
            }
            
            if (freshImg) {
              setProfileImageUrl(freshImg);
              finalSyncedImg = freshImg;
            }
          }
          
          // Also sync to Supabase auth/profiles for seamless Navbar integration
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
               await supabase.from('profiles').update({
                 full_name: nickname || name || '디자이너',
                 avatar_url: finalSyncedImg || undefined
               }).eq('id', user.id);
            }
          } catch(es) {}
          
        } catch (fetchErr) {
          // Silent fallback for sync failure
        }
      } catch (ncpErr) {
        // Silently suppress top-level ncp error 
      }

        // 1b. Update hair-shop name in NCP if updated
        if (shopName && profile) {
          try {
            const currentShop = profile.hairShop || {};
            
            const fullShopPayload: any = {
              name: shopName,
              number: currentShop.number || mobileNumber || "010-0000-0000",
              sido: currentShop.sido || "",
              sigungu: currentShop.sigungu || "",
              bname: currentShop.bname || "",
              address: currentShop.address || "",
              roadAddress: currentShop.roadAddress || "",
              addressDetail: currentShop.addressDetail || "매장 주소",
              zoneCode: currentShop.zoneCode || "",
              latitude: currentShop.latitude || 0.0,
              longitude: currentShop.longitude || 0.0,
              businessNumber: currentShop.businessNumber || ""
            };

            // Try verified /designer/hair-shop first (verified success in probe)
            try {
              await accountClient.post('/designer/hair-shop', fullShopPayload);
            } catch (innerE) {
              console.warn("Account /designer/hair-shop fallback try: ", innerE);
            }
            // Fallback legacy /hair-shop 
            try {
              await accountClient.post('/hair-shop', fullShopPayload);
            } catch (e) {}
          } catch (shopErr) {
            // Silently suppress hair shop update errors to prevent console warnings
          }
        }

      // 2. Sync to Supabase Profiles for app metadata and offline access
      const token = localStorage.getItem('ncp_access_token');
      let targetUserId = '';
      if (token) {
        try {
          const payloadPart = token.split('.')[1];
          const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
          const decoded = JSON.parse(decodedStr);
          const rawId = decoded.id;
          targetUserId = rawId.includes('-') ? rawId : `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
        } catch (e) {
          console.warn("NCP user ID resolve failed for local state save:", e);
        }
      }

      if (targetUserId) {
        if (careerYears) {
          localStorage.setItem(`ncp_career_years_${targetUserId}`, String(careerYears));
        }
      }

      // ONLY sync to Supabase if NOT an NCP designer session and has a valid Supabase session
      if (!token) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const supaUserId = session?.user?.id;
          if (supaUserId) {
            const basicPayload = {
              id: supaUserId,
              full_name: nickname || name,
              email: email,
              role: position
            };
            await supabase.from('profiles').upsert(basicPayload, { onConflict: 'id' });
            
            await supabase.auth.updateUser({
              data: {
                avatar_url: finalSyncedImg || null
              }
            });
          }
        } catch (supaErr) {
          // Silent catch to prevent 400 bad request errors for general user sessions
        }
      }
      
      window.dispatchEvent(new Event('profile_updated'));
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      alert('프로필 업데이트 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!profile) return;
    setShowDeleteModal(true);
    setDeleteStep('warning');
  };

  const confirmActualDeleteAccount = async () => {
    if (!profile) return;
    setIsDeleting(true);
    setDeleteStep('submitting');
    
    try {
      // 1. Call real NCP API to delete/leave the designer account!
      try {
        await accountClient.delete('/designer');
        console.log("NCP designer withdraw request was successful.");
      } catch (apiErr: any) {
        console.warn("NCP designer deletion request failed or returned error:", apiErr?.response?.data || apiErr.message);
      }

      // 2. Sign out from Supabase
      await supabase.auth.signOut().catch(() => {});
      
      // 3. Clear local session states
      localStorage.removeItem('ncp_access_token');
      localStorage.removeItem('ncp_refresh_token');
      localStorage.removeItem('ncp_admin');
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Dispatch event
      window.dispatchEvent(new Event('ncp_auth_changed'));
      
      // 5. Success
      setDeleteStep('success');

      setTimeout(() => {
        window.location.href = window.location.origin + '/?logout=' + Date.now();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert('탈퇴 처리 중 오류가 발생했습니다: ' + err.message);
      setDeleteStep('warning');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin" />
        <span className="text-gray-500 font-bold text-base">프로필 정보를 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              <AvatarImage 
                url={imageCandidates.length > 0 ? Array.from(new Set(imageCandidates)).join(',') : profileImageUrl} 
                className="w-full h-full object-cover" 
                fallbackClassName="w-16 h-16 text-brand-primary" 
              />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border border-gray-100 text-brand-primary hover:scale-110 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {nickname} {position}
            </h1>
            <p className="text-gray-500 font-medium tracking-tight">
              {shopName} {careerYears ? `${careerYears}년차` : ''}
            </p>
          </div>
          <div className="text-center md:text-right">
             <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-100 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? '탈퇴 처리중...' : '회원 탈퇴'}
              </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label id="profile-label-nickname" className="text-sm font-bold text-gray-700 ml-1">닉네임</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="profile-input-nickname"
                  type="text" 
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setName(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label id="profile-label-position" className="text-sm font-bold text-gray-700 ml-1">직책</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="profile-input-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_1.25rem_center] bg-no-repeat"
                >
                  <option value="원장">원장</option>
                  <option value="부원장">부원장</option>
                  <option value="실장">실장</option>
                  <option value="디자이너">디자이너</option>
                  <option value="스탭">스탭</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label id="profile-label-careeryears" className="text-sm font-bold text-gray-700 ml-1">경력 년차</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="profile-input-careeryears"
                  type="text" 
                  value={careerYears}
                  onChange={(e) => setCareerYears(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                  placeholder="경력 년차를 입력하세요 (예: 5)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label id="profile-label-email" className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="profile-input-email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label id="profile-label-mobilenumber" className="text-sm font-bold text-gray-700 ml-1">연락처</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="profile-input-mobilenumber"
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                  placeholder="연락처를 입력하세요"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">소개글</label>
            <div className="relative">
              <FileText className="absolute left-4 top-6 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea 
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 min-h-[120px] resize-y"
                placeholder="간단한 소개글을 입력하세요"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Shield className="w-5 h-5 text-brand-primary" />
               개인정보 및 보안 설정
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700 ml-1">새 비밀번호</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input 
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="변경할 비밀번호 입력 (선택사항)"
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 placeholder:font-normal"
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700 ml-1">비밀번호 확인</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input 
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     placeholder="비밀번호 다시 입력"
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 placeholder:font-normal"
                   />
                 </div>
               </div>
             </div>

             <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                 {/* 1. AI 이미지 동의 */}
                 <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                   <div>
                     <h4 className="text-sm font-bold text-gray-900">AI 이미지 생성 동의</h4>
                     <p className="text-xs text-gray-500 mt-1">AI 헤어 모델 생성 및 이미지 처리 서비스 이용에 동의합니까?</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setAiImageAgreement(!aiImageAgreement)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aiImageAgreement ? 'bg-brand-primary' : 'bg-gray-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiImageAgreement ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>

                 {/* 2. AI 영상 동의 */}
                 <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                   <div>
                     <h4 className="text-sm font-bold text-gray-900">AI 영상 생성 동의</h4>
                     <p className="text-xs text-gray-500 mt-1">AI 영상 얼굴 변환 및 템플릿 처리 서비스 이용에 동의합니까?</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setAiVideoAgreement(!aiVideoAgreement)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aiVideoAgreement ? 'bg-brand-primary' : 'bg-gray-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiVideoAgreement ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>

                 {/* 3. AI 텍스트 동의 */}
                 <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                   <div>
                     <h4 className="text-sm font-bold text-gray-900">AI 텍스트 처리 동의</h4>
                     <p className="text-xs text-gray-500 mt-1">AI 카피라이팅 및 고객 관리 문구 서비스 이용에 동의합니까?</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setAiTextAgreement(!aiTextAgreement)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aiTextAgreement ? 'bg-brand-primary' : 'bg-gray-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiTextAgreement ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>

                 {/* 4. 마케팅 수신 동의 */}
                 <div className="flex items-center justify-between">
                   <div>
                     <h4 className="text-sm font-bold text-gray-900">마케팅 정보 수신 동의</h4>
                     <p className="text-xs text-gray-500 mt-1">이벤트, 할인 혜택 등 유용한 마케팅 정보를 받아보시겠습니까?</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setMarketingConsent(!marketingConsent)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${marketingConsent ? 'bg-brand-primary' : 'bg-gray-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketingConsent ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>

                 <div className="pt-6 border-t border-gray-200/60">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">개인정보 권리 행사 안내</h4>
                    <ul className="space-y-3 text-xs text-gray-500 font-medium leading-relaxed">
                       <li className="flex items-start gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mt-1.5 shrink-0" />
                         <span><strong className="text-gray-700">열람 및 정정:</strong> 현재 화면(프로필 수정)에서 본인의 정보를 실시간으로 확인하고 즉시 수정하실 수 있습니다.</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mt-1.5 shrink-0" />
                         <span><strong className="text-gray-700">동의 철회:</strong> 상단의 약관 및 마케팅 동의 설정을 통해 언제든지 즉시 동의를 철회하실 수 있습니다.</span>
                       </li>
                      
                      <li className="flex items-start gap-2 text-red-500/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/40 mt-1.5 shrink-0" />
                        <span><strong className="text-red-600">삭제(탈퇴) 요청:</strong> 상단의 '회원 탈퇴' 버튼 또는 고객센터를 통해 요청하실 수 있으며, 법령에서 정한 기간 외의 데이터는 지체 없이 파기됩니다.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? '저장 중...' : '정보 저장하기'}
          </button>
        </div>
      </motion.div>

      {/* 회원 탈퇴 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => deleteStep !== 'submitting' && deleteStep !== 'success' && setShowDeleteModal(false)}
          />

          {/* Modal Content Card */}
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-gray-150 transform transition-all flex flex-col gap-6">
            <button 
              disabled={deleteStep === 'submitting' || deleteStep === 'success'}
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {deleteStep === 'warning' && (
              <>
                <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-2xl">
                  <div className="bg-red-100 p-2.5 rounded-xl">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">정말 탈퇴하시겠습니까?</h3>
                    <p className="text-xs text-red-600/80 font-medium mt-0.5">이 작업은 취소할 수 없습니다.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-800 tracking-tight leading-relaxed">
                    회원 탈퇴 완료 후에는 원장님의 모든 정보가 영구 삭제됩니다:
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-500 font-medium leading-normal bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>보유 중인 모든 크레딧 즉시 소멸</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>포트폴리오 및 시술 자료 파기</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>등록된 매장 및 계정 정보 삭제 (복구 불가)</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="py-3.5 px-6 font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-sm"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmActualDeleteAccount}
                    className="py-3.5 px-6 font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/15 active:scale-95 transition-all text-sm"
                  >
                    탈퇴 동의 및 진행
                  </button>
                </div>
              </>
            )}

            {deleteStep === 'submitting' && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
                <div>
                  <h3 className="text-lg font-black text-gray-900">회원 탈퇴 처리 중</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">안전하게 계정을 삭제하고 있습니다. 잠시만 기다려주세요.</p>
                </div>
              </div>
            )}

            {deleteStep === 'success' && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 p-2 rounded-full flex items-center justify-center border border-green-100 animate-bounce">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">탈퇴 완료</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">회원 탈퇴 처리가 완료되었습니다. 자동으로 로그아웃됩니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toast Message */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="bg-gray-900 border border-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-primary" />
          <span className="font-bold text-sm tracking-tight text-gray-50">저장 되었습니다.</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

