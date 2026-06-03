import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteSettings, defaultSiteSettings } from '../lib/siteSettings';
import { supabase } from '../supabase';

interface SiteContextProps {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SiteContext = createContext<SiteContextProps>({
  settings: defaultSiteSettings,
  updateSettings: async () => {},
  isLoading: true,
  error: null
});

export const useSiteContext = () => useContext(SiteContext);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage fallback first to prevent flickers
    const cached = localStorage.getItem('siteSettingsFallback');
    if (cached) {
      try { 
        const parsed = JSON.parse(cached);
        // Ensure new top-level settings are merged with cached version
        setSettings({ ...defaultSiteSettings, ...parsed }); 
      } catch(e) {}
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (data && !error) {
           const merged = { ...defaultSiteSettings };
           const d = data as any;
           
           // Support legacy 'settings' blob fallback during migration
           const legacy = d.settings || {};
           
           // List of all top-level keys in SiteSettings
           const keys: (keyof SiteSettings)[] = [
             'nav', 'hero', 'features', 'aiDemo', 
             'pricing', 'cta', 'footer', 'layers', 
             'sectionOrder', 'integrations',
             'seoSettings', 'promoSettings', 
             'partnerSettings', 'partners', 'parkingPage',
             'popups', 'eventPosts', 'creditSettings'
           ];

           keys.forEach(key => {
             let val;
             // Map snake_case database columns to camelCase SiteSettings keys
             if (key === 'aiDemo') val = d.ai_demo ?? legacy.aiDemo;
             else if (key === 'sectionOrder') val = d.section_order ?? legacy.sectionOrder;
             else val = d[key] ?? legacy[key];

             if (val !== undefined && val !== null) {
               if (merged[key] && typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
                 merged[key] = { ...merged[key], ...val } as any;
               } else {
                 merged[key] = val;
               }
             }
           });

           setSettings(merged);
           localStorage.setItem('siteSettingsFallback', JSON.stringify(merged));
        } else if (error && error.code !== 'PGRST116') {
           console.warn("Could not fetch site settings:", error.message);
        }
      } catch (err: any) {
        if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
          console.error("Context fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    // Optimistic update
    setSettings(newSettings);
    localStorage.setItem('siteSettingsFallback', JSON.stringify(newSettings));
    setError(null);

    // Try to update via secure backend proxy first to bypass client-side RLS limits
    try {
      // [명확한 서버 아키텍처 규칙 정의]
      // 1. 사용자/점주 계정 : NCP 서버 기반 (회원가입, 크레딧, 구독 상태 - x-cubric-designer-token/NCP 토큰 기반)
      // 2. 관리자 계정 : Supabase 서버 기반 (홈페이지 편집, 관리자 설정 및 파킹 페이지 제어 데이터, CS 어드민 데이터)
      // 홈페이지 편집 및 파킹 페이지 활성화 등은 관리자 전용이며 Supabase 세션 토큰이 필수적입니다.
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      if (!token) {
        throw new Error(
          '관리자 인증 토큰을 찾을 수 없습니다.\n\n' +
          '[안내] 일반 회원/점주 계정(NCP 서버 기반)과 홈페이지 관리자 계정(Supabase 서버 기반)은 서로 분리된 독립 서버를 이용합니다.\n' +
          '파킹 페이지 설정 및 사이트 정보를 저장하시려면, 로그인 모달창 하단의 "관리자 로그인하기"를 클릭하시어 수퍼 관리자 계정(로그인 이메일/비밀번호)으로 로그인하신 후 시도해 주시기 바랍니다.'
        );
      }

      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newSettings })
      });

      if (response.ok) {
        console.log('[SiteContext] Saved settings successfully via secure backend proxy.');
        return;
      } else {
        const errData = await response.json().catch(() => ({}));
        let errMsg = errData.error || `HTTP error ${response.status}: ${response.statusText}`;
        if (response.status === 401 || response.status === 403) {
          errMsg = 
            '작업을 수행할 수 없습니다.\n\n' +
            '[안내] 일반 회원 또는 잘못된 계정으로 로그인되어 관리자 권한이 부족합니다.\n' +
            '홈페이지 관리자 권한을 가진 계정(이메일/비번 형태)으로 다시 로그인해 주십시오.';
        }
        throw new Error(errMsg);
      }
    } catch (proxyErr: any) {
      console.error('[SiteContext] Failed saving via backend proxy:', proxyErr.message || proxyErr);
      setError(proxyErr.message || '저장 중 오류가 발생했습니다.');
      throw proxyErr;
    }
  };

  return (
    <SiteContext.Provider value={{ settings, updateSettings, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  );
};
