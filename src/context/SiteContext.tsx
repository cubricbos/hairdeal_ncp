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
             'popups', 'eventPosts'
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

    try {
      const { error } = await Promise.race([
        supabase
          .from('site_settings')
          .upsert({ 
            id: 'default',
            updated_at: new Date().toISOString(),
            // Legacy blob for dual-write compatibility
            settings: newSettings,
            // New individual columns for stability
            nav: newSettings.nav,
            hero: newSettings.hero,
            features: newSettings.features,
            ai_demo: newSettings.aiDemo,
            pricing: newSettings.pricing,
            cta: newSettings.cta,
            footer: newSettings.footer,
            layers: newSettings.layers,
            section_order: newSettings.sectionOrder,
            integrations: newSettings.integrations
          }, { onConflict: 'id' }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Supabase Database Timeout")), 10000))
      ]);
      
      if (error) {
        if (error.code === '42P01') {
           setError("site_settings 데이터베이스 테이블이 생성되지 않았습니다.\\nSupabase에서 테이블 생성 SQL을 실행해주세요.");
           throw new Error("Table missing");
        } else {
           setError(error.message);
           throw error;
        }
      }
    } catch (err) {
      console.error(err);
      // Re-throw to be handled by the UI
      throw err;
    }
  };

  return (
    <SiteContext.Provider value={{ settings, updateSettings, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  );
};
