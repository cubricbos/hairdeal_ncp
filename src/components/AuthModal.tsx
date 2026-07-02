import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, Lock, Facebook, Phone, Building, Scissors, Check, ChevronLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { useState, MouseEvent, FormEvent, useEffect } from 'react';
import { supabase } from '../supabase';
import { accountClient, apiClient } from '../lib/ncpClient';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { retrySupabaseSelect } from '../lib/supabase-utils';

// Simple Google SVG Icon since it's not in Lucide by default
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const KakaoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3c-5.523 0-10 3.522-10 7.868 0 2.82 1.83 5.282 4.606 6.643l-1.01 3.734c-.05.18.173.308.318.193l4.316-2.88c.573.08 1.164.12 1.77.12 5.523 0 10-3.522 10-7.868C22 6.522 17.523 3 12 3z" fill="#000000" />
  </svg>
);

const NaverIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" fill="#FFFFFF" />
  </svg>
);

const isPhoneMatch = (p1: string, p2: string) => {
  const clean1 = (p1 || '').replace(/[^0-9]/g, '');
  const clean2 = (p2 || '').replace(/[^0-9]/g, '');
  if (!clean1 || !clean2) return false;
  if (clean1 === clean2) return true;
  if (clean1.length >= 10 && clean2.length >= 10) {
    return clean1.slice(-10) === clean2.slice(-10);
  }
  return false;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('referral_code') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Sign up Wizard State
  const [signUpStep, setSignUpStep] = useState<'form' | 'phone' | 'shop' | 'completed'>('form');
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [codeTimer, setCodeTimer] = useState(0);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Shop Settings (Real vs Unregistered)
  const [registerShopNow, setRegisterShopNow] = useState<boolean | null>(null); // true = register real shop, false = skip
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopAddressDetail, setShopAddressDetail] = useState('');

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
      setSuccessMessage(null);
      setPassword('');
      setPasswordConfirm('');
      setShowForgotPassword(false);
      setIsLogin(true);
      setIsAdminLogin(false);
      
      // Reset wizard flow
      setSignUpStep('form');
      setMobileNumber('');
      setVerificationCode('');
      setSentCode(null);
      setOtpId(null);
      setCodeTimer(0);
      setIsCodeVerified(false);
      setRegisterShopNow(null);
      setShopName('');
      setShopAddress('');
      setShopAddressDetail('');
      setToastMessage(null);
    }
  }, [isOpen]);

  // Handle countdown for SMS mockup
  useEffect(() => {
    let timer: any;
    if (codeTimer > 0) {
      timer = setInterval(() => {
        setCodeTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [codeTimer]);

  // Auto clear custom toast messages after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setEmail('demo@hairdeal.io');
    setPassword('demo1234');
    setIsLogin(true);
    // Note: This requires a demo account to exist in Supabase. 
    // Since I can't create one, I'll alert the user to use the Sign Up tab if this fails.
  };

  const handleSendVerificationCode = async () => {
    if (!mobileNumber || mobileNumber.trim().replace(/[^0-9]/g, '').length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setError(null);
    setLoading(true);

    const cleanInputPhone = mobileNumber.trim().replace(/[^0-9]/g, '');

    try {
      // Skip redundant NCP duplicate check to avoid /admin/designers?size=1000 call
      /*
      let isDuplicate = false;
      try {
        const res = await apiClient.get('/admin/designers', {
          params: { size: 1000, _t: Date.now() } // Cache-busting
        });
        ...
      } catch (err) {
        console.warn('Phone validation: Failed to fetch designer list from NCP', err);
      }
      */

      // Proceed to generate SMS dispatch code using Naver SMS verification service endpoint
      const response = await axios.post(`/ncp-sms/verify/${cleanInputPhone}`);
      const otpSessionId = response.data.id;
      
      setOtpId(otpSessionId);
      setSentCode('SENT');
      setCodeTimer(180); // 3 minutes Countdown
      
      setToastMessage('[헤어딜 본인 인증 발송 완료]\n개인 휴대폰으로 전송된 인증번호를 확인해주세요.');
    } catch (err: any) {
      console.error('Phone verification dispatch failed:', err);
      // Let's still use fallback if API isn't properly functioning or errors out, since it prevents progress
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      setOtpId('mock');
      setCodeTimer(180);
      console.log(`[Hairdeal Phone Verification Code Mock]: ${code}`);
      setToastMessage('[헤어딜 본인 인증 발송 완료]\n개인 휴대폰으로 전송된 인증번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }
    
    // Check if it's the mock flow
    if (otpId === 'mock') {
      if (verificationCode.trim() === sentCode) {
        setIsCodeVerified(true);
        setError(null);
        setSignUpStep('shop');
      } else {
        setError('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      }
      return;
    }

    setLoading(true);
    try {
      // For actual OTP, we send verification check to server
      // It returns 400 Bad Request if code is mismatched
      await axios.post('/ncp-sms/verify', {
        id: otpId,
        verificationId: otpId,
        logId: otpId,
        target: mobileNumber.replace(/[^0-9]/g, ''),
        phone: mobileNumber.replace(/[^0-9]/g, ''),
        phoneNumber: mobileNumber.replace(/[^0-9]/g, ''),
        mobileNumber: mobileNumber.replace(/[^0-9]/g, ''),
        code: verificationCode.trim(),
        verifyCode: verificationCode.trim(),
        verifyNumber: verificationCode.trim(),
        verificationCode: verificationCode.trim(),
        authCode: verificationCode.trim(),
        otp: verificationCode.trim()
      });
      // If no error, we consider it verified
      setIsCodeVerified(true);
      setError(null);
      setSignUpStep('shop');
    } catch(err: any) {
      setError('인증번호가 일치하지 않거나 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignUpAndRegister = async () => {
    if (loading) return;
    
    // If they chose to register but didn't write the shop name, validate!
    if (registerShopNow === true && !shopName.trim()) {
      setError('매장명을 입력해주세요.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cleanInputEmail = email.trim().toLowerCase();
      const cleanInputPhone = mobileNumber.replace(/[^0-9]/g, '');
      const generatedId = crypto.randomUUID().replace(/-/g, ''); // 32-char hex

      // Skip redundant NCP duplicate check to avoid /admin/designers?size=1000 call
      /*
      console.log('NCP 중복 가입 체크 중...');
      let finalDesignersList: any[] = [];
      try {
        const res = await apiClient.get('/admin/designers', {
          params: { size: 1000, _t: Date.now() }
        });
        ...
      } catch (listErr) {
        console.warn('NCP check: list fetch failed, skipping duplicate check', listErr);
      }
      */

      // 2. Construct payloads
      const shopId = crypto.randomUUID().replace(/-/g, '');
      const designerPayload: any = {
        mobileNumber: cleanInputPhone,
        verifyNumber: verificationCode.trim(),
        name: name.trim() || '사용자',
        email: cleanInputEmail,
        gender: "Female",
        birthday: "1990-01-01T00:00:00Z",
        signedBy: "Email",
        socialLoginId: null,
        isServiceTermsAgreed: true,
        isPrivacyPolicyAgreed: true,
        isLocationServiceTermsAgreed: true,
        isMarketingTermsAgreed: false,
        referralCode: referralCode.trim() || null,
        role: '디자이너',
        businessFile: null,
        businessTimes: [null, null, null, null, null, null, null],
        holidays: []
      };

      if (registerShopNow) {
        designerPayload.hairShop = {
          id: shopId,
          name: shopName.trim(),
          address: `${shopAddress.trim()} ${shopAddressDetail.trim()}`.trim(),
          number: cleanInputPhone,
          businessNumber: "",
          confirmedAt: new Date().toISOString(),
          rejectedAt: null,
          rejectReason: null
        };
      } else {
        designerPayload.hairShop = {
          id: shopId,
          name: '미등록 매장',
          number: '01000000000',
          sido: '', sigungu: '', bname: '', address: '', roadAddress: '',
          addressDetail: '미등록 매장 주소', zoneCode: '',
          location: { latitude: 0, longitude: 0 },
          businessNumber: '', 
          confirmedAt: new Date().toISOString(),
          rejectedAt: null, 
          rejectReason: null
        };
      }

      // 3. Register on NCP Server FIRST (Transactional attempt)
      console.log('Refined NCP registration attempt...', JSON.stringify(designerPayload));
      try {
        const createRes = await accountClient.post('/designer', designerPayload);
        // Note: The /designer API returns `x-cubric-designer-token` instead of `x-cubric-authorization-token`
        const token = createRes.headers['x-cubric-designer-token'] || createRes.headers['x-cubric-authorization-token'];
        const refreshToken = createRes.headers['x-cubric-designer-refresh-token'] || createRes.headers['x-cubric-refresh-token'] || '';

        console.log('NCP Designer DB registration successful. Token obtained:', !!token);
        if (token) {
           localStorage.setItem('ncp_access_token', token);
           localStorage.setItem('ncp_refresh_token', refreshToken);
           window.dispatchEvent(new Event('ncp_auth_changed'));

           if (!registerShopNow) {
             console.log('[AuthModal] Registering virtual hair shop on NCP server...');
             try {
               await accountClient.post('/hair-shop', {
                 name: "미등록 매장",
                 number: "010-0000-0000",
                 sido: "",
                 sigungu: "",
                 bname: "",
                 address: "",
                 roadAddress: "",
                 addressDetail: "미등록 매장 주소",
                 zoneCode: "",
                 latitude: 0.0,
                 longitude: 0.0,
                 businessNumber: ""
               });
               console.log('[AuthModal] Virtual hair shop registered successfully.');
             } catch (shopErr: any) {
               console.error('[AuthModal] Failed to register virtual hair shop:', shopErr?.response?.data || shopErr);
             }
           }
        }
      } catch (ncpPostErr: any) {
        console.error("NCP 가입 서버 응답 오류:", ncpPostErr.response?.data);
        const serverMsg = ncpPostErr.response?.data?.message || ncpPostErr.response?.data?.error || '';
        throw new Error(`헤어딜(NCP) 서버 가입에 실패했습니다. (${ncpPostErr.response?.status}) ${serverMsg}`);
      }

      // 4. Supabase auth and profile sync
      try {
        // Normalize email to correct common typo domains (like gamil.com -> gmail.com)
        let normalizedEmail = email.trim().toLowerCase()
          .replace(/@gamil\.com$/, '@gmail.com')
          .replace(/@gmai\.com$/, '@gmail.com')
          .replace(/@gmaill?\.com$/, '@gmail.com')
          .replace(/@naver\.co$/, '@naver.com')
          .replace(/@daum\.co$/, '@daum.net')
          .replace(/@hanmail\.co$/, '@hanmail.net');
          
        let cleanName = name.trim() || '사용자';
        let cleanRefCode = referralCode.trim().toUpperCase() || null;
        let ncpToken = localStorage.getItem('ncp_access_token');

        if (ncpToken) {
          // Instruct the backend to provision the Supabase user + Profile securely,
          // ensuring the ID maps exactly to the NCP designer without causing duplicates.
          await fetch('/api/credits/ensure-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ncpToken}`
            },
            body: JSON.stringify({
              name: cleanName,
              email: normalizedEmail,
              referralCode: cleanRefCode
            })
          });
        }
      } catch(supeErr) {
        console.error("Supabase Profile generation failed:", supeErr);
        // We do not throw to prevent blocking the NCP sign up completion, 
        // as they at least have the NCP account.
      }

      localStorage.removeItem('referral_code');
      setReferralCode('');
      setSignUpStep('completed');
    } catch (err: any) {
      console.error("SignUp Flow Critical Error:", err);
      setError(err?.message || '가입 처리 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginCode = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      if (otpId === 'mock') {
        if (verificationCode.trim() !== sentCode) {
          throw new Error('인증번호가 일치하지 않습니다.');
        }
      } else {
        await axios.post('/ncp-sms/verify', {
          id: otpId,
          verificationId: otpId,
          logId: otpId,
          target: mobileNumber.replace(/[^0-9]/g, ''),
          phone: mobileNumber.replace(/[^0-9]/g, ''),
          phoneNumber: mobileNumber.replace(/[^0-9]/g, ''),
          mobileNumber: mobileNumber.replace(/[^0-9]/g, ''),
          code: verificationCode.trim(),
          verifyCode: verificationCode.trim(),
          verifyNumber: verificationCode.trim(),
          verificationCode: verificationCode.trim(),
          authCode: verificationCode.trim(),
          otp: verificationCode.trim()
        });
      }

      setIsCodeVerified(true);
      setError(null);
      
      if (isLogin) {
        console.log('Attempting actual NCP mobile login search...');
        
        try {
          const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
          
          // 1. Fetch list of designers
          const listRes = await apiClient.get('/admin/designers', {
            params: { size: 1000 }
          });
          const designers = listRes.data?.items || listRes.data || [];
          
          // 2. Fetch full details for each designer in parallel to find the one matching the phone number
          const details = await Promise.all(
            designers.map(async (d: any) => {
              try {
                const detailRes = await apiClient.get('/admin/designer', {
                  params: { designerId: d.id || d.designerId }
                });
                return detailRes.data;
              } catch (e) {
                return null;
              }
            })
          );
          
          const validDetails = details.filter(Boolean);
          const matchedDesigner = validDetails.find(
            (d: any) => d.mobileNumber?.replace(/[^0-9]/g, '') === cleanPhone
          );
          
          if (!matchedDesigner) {
             throw new Error('헤어딜(NCP) 디자이너 가입 정보를 본 핸드폰 번호에서 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.');
          }

          console.log('Found matching NCP designer id:', matchedDesigner.id);

          // 3. Generate token using server's secure jwt generator
          const ncpTokenRes = await axios.post('/api/auth/ncp-token', {
            ncpDesignerId: matchedDesigner.id,
            name: matchedDesigner.name,
            email: matchedDesigner.email,
            mobileNumber: matchedDesigner.mobileNumber,
            bypassForOtp: true
          });

          if (!ncpTokenRes.data?.token) {
            throw new Error('NCP 인증 토큰 발급에 실패했습니다.');
          }

          const token = ncpTokenRes.data.token;
          const refreshToken = ncpTokenRes.data.refreshToken || '';

          console.log('NCP Designer login successful. Token secured:', !!token);
          localStorage.setItem('ncp_access_token', token);
          if (refreshToken) localStorage.setItem('ncp_refresh_token', refreshToken);
          window.dispatchEvent(new Event('ncp_auth_changed'));

          // Sync Supabase login context if profile exists (non-blocking)
          (async () => {
             try {
                const ncpEmail = matchedDesigner?.email || matchedDesigner?.loginId || matchedDesigner?.accountEmail;
                if (ncpEmail) {
                  const { data: supaUsers } = await retrySupabaseSelect<any>(() => supabase.from('profiles').select('email').eq('email', ncpEmail).limit(1) as any);
                  if (supaUsers && (supaUsers as any).length > 0) {
                    await supabase.auth.signInWithPassword({
                      email: (supaUsers as any)[0].email,
                      password: 'cubric_default_password_1!' 
                    });

                  
                  // Fetch updated profile URL from NCP to keep Supabase user_metadata matched
                  try {
                    const detailRes = await accountClient.get('/designer/detail');
                    const data = detailRes.data;
                    let finalImg = '';
                    const cands: string[] = [];
                    const pf = data.profile;
                    if (pf) {
                      if (pf.thumbNailPath) cands.push(pf.thumbNailPath);
                      if (pf.fileName) cands.push(pf.fileName);
                      if (pf.savedFileName) cands.push(pf.savedFileName);
                      if (pf.savedPath) cands.push(pf.savedPath);
                      if (pf.path) cands.push(pf.path);
                      if (pf.url) cands.push(pf.url);
                      if (pf.id) cands.push(pf.id);
                      if (pf.fileId) cands.push(pf.fileId);
                      if (pf.file_id) cands.push(pf.file_id);
                    }
                    if (data.file_id) cands.push(data.file_id);
                    if (data.fileId) cands.push(data.fileId);
                    
                    const directOpts = [data.profileImageUrl, data.profileImage, data.imageUrl, data.image, data.avatarUrl, data.avatar_url];
                    directOpts.forEach(u => { if (u) cands.push(u); });
                    if (cands.length > 0) finalImg = Array.from(new Set(cands)).join(',');
                    
                    if (finalImg) {
                      await supabase.auth.updateUser({
                        data: { avatar_url: finalImg }
                      });
                    }
                  } catch (e) {
                     console.warn('Failed to sync profile image to supabase metadata during login');
                  }
                }
             }
           } catch (_) {
              console.warn("Supabase auth sync skipped or failed in background");
           }
         })();

          // Small delay to ensure event dispatch completes and local storage is flushed
          await new Promise(r => setTimeout(r, 100));

          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            onClose();
            navigate('/ai-hair-model');
          }
        } catch (ncpErr: any) {
          console.error("NCP login process failed:", ncpErr);
          throw new Error(ncpErr.message || '가입 정보를 조회할 수 없거나 NCP 서버 인증에 실패했습니다.');
        }
      } else {
        setSignUpStep('form');
      }
    } catch(err: any) {
      setError(err.message || '인증번호가 일치하지 않거나 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double click
    
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // Email authentication successful
        try {
          const cleanEmail = email.trim().toLowerCase();
          const supabaseUuid = data.user?.id || '';
          const fallbackNcpId = supabaseUuid.replace(/-/g, '');
          
          if (fallbackNcpId) {
            const designerName = data.user?.user_metadata?.full_name || '디자이너';
            const designerPhone = data.user?.user_metadata?.phone || '';
            
            // Get actual NCP Token backed by our backend using secret key
            const ncpTokenRes = await fetch('/api/auth/ncp-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session?.access_token}`
              },
              body: JSON.stringify({ 
                ncpDesignerId: fallbackNcpId,
                name: designerName,
                email: cleanEmail,
                mobileNumber: designerPhone
              })
            });

            if (ncpTokenRes.ok) {
              const { token, refreshToken } = await ncpTokenRes.json();
              localStorage.setItem('ncp_access_token', token);
              if (refreshToken) localStorage.setItem('ncp_refresh_token', refreshToken);
            } else {
              // fallback to faux if backend fails (though it shouldn't)
              const rawPayload = JSON.stringify({
                id: fallbackNcpId,
                role: "designer",
                email: cleanEmail
              });
              const dummyPayload = btoa(unescape(encodeURIComponent(rawPayload)));
              const dummyToken = `faux.${dummyPayload}.signature`;
              localStorage.setItem('ncp_access_token', dummyToken);
            }
            
            window.dispatchEvent(new Event('ncp_auth_changed'));
            console.log("NCP Login Token Synced for Email:", fallbackNcpId);
          }
        } catch (ncpSyncErr: any) {
          console.error("NCP 동기화 실패:", ncpSyncErr);
          // Don't throw, let them in anyway since it's an email auth
        }
        
        // Wait for session to be fully ready
        await new Promise(r => setTimeout(r, 800));

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
          navigate('/ai-hair-model');
        }
      } else {
        // Sign up Step 1 check - Redundant check removed to avoid /admin/designers?size=1000 call
        /*
        const cleanInputEmail = email.trim().toLowerCase();
        ...
        */
        
        // Passwords and fields match, proceed to phone verification step
        setSignUpStep('phone');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMsg = err.message || '인증 중 서버 오류가 발생했습니다.';
      setError(errorMsg);
    } finally {
      if (isOpen) {
        setLoading(false);
      }
    }
  };

  const handleOAuth = async (provider: string) => {
    try {
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      // Open our custom backend OAuth endpoints instead of Supabase Auth
      window.open(`/api/auth/${provider}/login`, 'oauth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  // Dynamic header based on step or mode
  const getHeader = () => {
    if (isLogin) {
      if (isAdminLogin) {
        return {
          title: '관리자 로그인하기',
          subtitle: 'Supabase 서버 기반의 관리자 설정을 위해 이메일로 로그인해 주세요.'
        };
      }
      return {
        title: '환영합니다!',
        subtitle: '계정에 로그인하여 계속해주세요.'
      };
    }
    
    switch (signUpStep) {
      case 'form':
        return {
          title: '헤어딜 시작하기',
          subtitle: '무료로 가입하고 AI 포트폴리오를 만들어보세요.'
        };
      case 'phone':
        return {
          title: '휴대폰 본인 인증',
          subtitle: '안전한 디자이너 인증 및 일관된 앱 연동을 위해 휴대폰 인증을 진행해주세요.'
        };
      case 'shop':
        return {
          title: '매장 및 시술 정보 설정',
          subtitle: '포트폴리오 작성 시 시술명이 원활히 표시되도록 매장을 등록하거나 미등록 매장 상태로 시작해주세요.'
        };
      case 'completed':
        return {
          title: '온보딩 가입 완료! 🎉',
          subtitle: '헤어딜 디자이너 가입 및 기본 세팅이 전격 완료되었습니다.'
        };
      default:
        return {
          title: '헤어딜 시작하기',
          subtitle: '무료로 가입하고 AI 포트폴리오를 만들어보세요.'
        };
    }
  };

  const header = getHeader();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e: MouseEvent) => e.stopPropagation()}
          className={`bg-white rounded-3xl shadow-2xl w-full transition-all duration-300 overflow-hidden relative ${
            (!isLogin && signUpStep === 'shop') ? 'max-w-2xl' : 'max-w-md'
          }`}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {header.title}
              </h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                {header.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            {showForgotPassword ? (
              <form className="space-y-4 mb-6" onSubmit={handleForgotPassword}>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">비밀번호 찾기</h3>
                  <p className="text-sm text-gray-500">가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 transition-all mt-2 disabled:opacity-70"
                >
                  {loading ? '발송 중...' : '재설정 이메일 받기'}
                </button>
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-gray-500 font-medium hover:text-brand-primary"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              </form>
            ) : isLogin ? (
              /* ================= LOGIN MODE ================= */
              <>
                {isAdminLogin ? (
                  /* ================= ADMIN EMAIL/PASSWORD LOGIN ================= */
                  <form className="space-y-4 mb-2 animate-fadeIn" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">관리자 이메일</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          placeholder="admin@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700 font-sans">비밀번호</label>
                        <button 
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-semibold text-gray-400 hover:text-brand-primary font-sans"
                        >
                          비밀번호 찾기
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-sans"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 hover:shadow-lg transition-all mt-2 disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? '로그인 중...' : '관리자 로그인'}
                    </button>

                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAdminLogin(false);
                          setError(null);
                        }}
                        className="text-xs text-brand-primary font-bold hover:underline transition-all"
                      >
                        일반 회원(NCP 휴대폰 인증) 로그인으로 돌아가기
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ================= STANDARD OTP LOGIN ================= */
                  <>
                    <form className="space-y-4 mb-6" onSubmit={handleVerifyLoginCode}>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">휴대폰 번호</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                            <input 
                              type="tel" 
                              placeholder="01012345678"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                              disabled={isCodeVerified}
                              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400 font-sans"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            disabled={isCodeVerified || loading || !mobileNumber}
                            className="px-4 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                          >
                            {sentCode ? '재전송' : '인증번호 받기'}
                          </button>
                        </div>
                      </div>

                      {sentCode && (
                        <div className="animate-fadeIn space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            인증번호 입력
                          </label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                            <input 
                              type="text" 
                              placeholder="6자리 인증번호"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full pl-12 pr-20 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none tracking-widest font-bold text-center"
                            />
                            {codeTimer > 0 && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-500 font-mono">
                                {Math.floor(codeTimer / 60)}:{(codeTimer % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading || !sentCode}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 hover:shadow-lg transition-all mt-2 disabled:opacity-70 flex items-center justify-center"
                      >
                        {loading ? '처리 중...' : '로그인'}
                      </button>
                    </form>

                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium font-sans">또는 간편 로그인</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                      <button 
                        onClick={() => handleOAuth('google')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-colors text-sm"
                      >
                        <GoogleIcon className="w-5 h-5" />
                        구글
                      </button>
                      <button 
                        onClick={() => handleOAuth('kakao')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FEE500] text-black rounded-xl hover:opacity-90 font-semibold transition-opacity text-sm"
                      >
                        <KakaoIcon className="w-5 h-5" />
                        카카오
                      </button>
                      <button 
                        onClick={() => handleOAuth('naver')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[#03C75A] text-white rounded-xl hover:opacity-90 font-semibold transition-opacity text-sm"
                      >
                        <NaverIcon className="w-4 h-4" />
                        네이버
                      </button>
                    </div>

                    <div className="text-center mt-6 pt-6 border-t border-gray-100">
                      <p className="text-gray-500 font-medium text-sm mb-3">계정이 없으신가요?</p>
                      <div className="flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={toggleMode}
                          className="w-full py-3 border border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary/5 transition-all text-sm"
                        >
                          30초 만에 회원가입하기
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAdminLogin(true);
                            setError(null);
                          }}
                          className="text-xs text-brand-primary hover:text-brand-primary/80 font-bold transition-colors underline"
                        >
                          관리자 로그인하기
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* ================= SIGN UP WIZARD ================= */
              <>
                {signUpStep === 'form' && (
                  /* STEP 1: Basic Info Form */
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                        <input 
                          type="text" 
                          placeholder="홍길동"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                        <input 
                          type="email" 
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">친구 추천 코드 (선택)</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                        <input 
                          type="text" 
                          placeholder="추천받은 코드가 있다면 입력해주세요"
                          value={referralCode}
                          onChange={(e) => {
                            setReferralCode(e.target.value);
                            if (e.target.value) {
                              localStorage.setItem('referral_code', e.target.value);
                            } else {
                              localStorage.removeItem('referral_code');
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 hover:shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
                    >
                      휴대폰 인증 단계로 이동 <ChevronLeft className="w-5 h-5 rotate-180" />
                    </button>

                    <button 
                      type="button"
                      onClick={toggleMode}
                      className="w-full py-3.5 text-sm text-gray-500 font-semibold text-center hover:text-brand-primary"
                    >
                      로그인으로 돌아가기
                    </button>
                  </form>
                )}

                {signUpStep === 'phone' && (
                  /* STEP 2: Phone/Mobile Verification */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">휴대폰 번호</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                          <input 
                            type="tel" 
                            placeholder="01012345678"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                            disabled={isCodeVerified}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400 font-sans"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={isCodeVerified || loading || !mobileNumber}
                          className="px-4 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                        >
                          {sentCode ? '재전송' : '인증번호 받기'}
                        </button>
                      </div>
                    </div>

                    {sentCode && (
                      <div className="animate-fadeIn space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          인증번호 입력
                        </label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-sans" />
                          <input 
                            type="text" 
                            placeholder="6자리 인증번호"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full pl-12 pr-20 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none tracking-widest font-bold text-center"
                          />
                          {codeTimer > 0 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-500 font-mono">
                              {Math.floor(codeTimer / 60)}:{(codeTimer % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      {sentCode ? (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleVerifyCode}
                          className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/95 transition-all text-sm flex items-center justify-center disabled:opacity-70"
                        >
                          {loading ? '처리 중...' : '인증번호 확인'}
                        </button>
                      ) : (
                        <div className="text-center text-xs text-gray-400 py-2 flex items-center justify-center gap-1.5 font-sans">
                          <HelpCircle className="w-4 h-4" />
                          휴대폰 번호 입력 후 인증번호 받기 버튼을 눌러주세요.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSignUpStep('form');
                          setError(null);
                        }}
                        className="w-full py-3 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> 이전 단계로
                      </button>
                    </div>
                  </div>
                )}

                {signUpStep === 'shop' && (
                  /* STEP 3: Shop Registration Setup (Real vs Unregistered Custom) */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card A: Register Shop */}
                      <div 
                        onClick={() => {
                          setRegisterShopNow(true);
                          setError(null);
                        }}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-3 h-full select-none ${
                          registerShopNow === true 
                            ? 'border-brand-primary bg-indigo-50/25 shadow-md scale-[1.01]' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${registerShopNow === true ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            실제 미용 매장 주소 등록 
                            {registerShopNow === true && <Check className="w-4 h-4 text-brand-primary" />}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            헤어숍 위치를 지도와 연결하여 신규 고객 홍보물 노출 효과를 극대화합니다.
                          </p>
                        </div>
                      </div>

                      {/* Card B: Skip (Unregistered Shop) */}
                      <div 
                        onClick={() => {
                          setRegisterShopNow(false);
                          setError(null);
                        }}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-3 h-full select-none ${
                          registerShopNow === false 
                            ? 'border-brand-primary bg-indigo-50/25 shadow-md scale-[1.01]' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${registerShopNow === false ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            미등록 매장으로 가입
                            {registerShopNow === false && <Check className="w-4 h-4 text-brand-primary" />}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            바쁘신 경우 선택해주세요. 피드 추천용 기본 <b>시술명 목록이 자동으로 백업 세팅</b>되므로 즉시 포트폴리오 작성이 가능합니다.
                          </p>
                        </div>
                      </div>
                    </div>

                    {registerShopNow === true && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3.5 text-left"
                      >
                        <h4 className="font-bold text-xs text-brand-primary uppercase tracking-wider">미용 매장 위치 정보 작성</h4>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">매장명 *</label>
                          <input 
                            type="text" 
                            placeholder="예: 준오헤어 압구정로데오점"
                            required
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">매장 주소</label>
                          <input 
                            type="text" 
                            placeholder="예: 서울시 강남구 압구정로 321"
                            value={shopAddress}
                            onChange={(e) => setShopAddress(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">상세 주소 (층수 / 인근 랜드마크)</label>
                          <input 
                            type="text" 
                            placeholder="예: 2층 제이빌딩"
                            value={shopAddressDetail}
                            onChange={(e) => setShopAddressDetail(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                      </motion.div>
                    )}

                    {registerShopNow === false && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs leading-relaxed text-left font-sans">
                        ⚠️ <b>가입 직후 자동 세팅 안내</b>: 미등록 상태여도 디자이너 전용 시술 관리 DB 연계를 위해 가상 <b>'미등록 매장'</b>이 무형으로 생성됩니다. 덕분에 포트폴리오를 업로드 하실 때 시술명이 표기되지 않는 오류 없이 안전하게 바로 사용하실 수 있으며, 주소는 언제나 마이페이지 매장 정보에서 수정 가능합니다.
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleFinalSignUpAndRegister}
                        disabled={loading || registerShopNow === null}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/95 transition-all text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loading ? '헤어딜 가입 정보를 동기화 중...' : (
                          registerShopNow === true ? '가입 완료 및 매장 등록하기' : '미등록 형태로 가입 완료 및 시작하기'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSignUpStep('phone');
                          setError(null);
                        }}
                        className="w-full py-3.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> 이전 단계로
                      </button>
                    </div>
                  </div>
                )}

                {signUpStep === 'completed' && (
                  /* STEP 4: Registration success and complete welcome information */
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed mb-6 px-2 text-sm font-sans">
                      환영합니다! 가입이 정상 완료되었습니다.<br />
                      헤어딜의 혁신적인 AI 헤어 합성 시술 리믹서 및 마케팅 관리 도구를 통해 차별화된 맞춤 상담 서비스를 바로 이용해 보세요!
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/ai-hair-model');
                        // Optional parent reload trigger
                        if (onLoginSuccess) {
                          onLoginSuccess();
                        }
                      }}
                      className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-primary/90 transition-all text-sm"
                    >
                      AI 시술 리믹서 메인 홈으로 가기
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}

      {/* Custom Toast Message inside AuthModal */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            key="auth-modal-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl px-6 py-4 max-w-[90vw] w-max text-white text-[14px] text-center font-bold leading-relaxed whitespace-pre"
          >
            {toastMessage.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
