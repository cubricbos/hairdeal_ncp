import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface AppMetrics {
  totalVisits: number;
  todayVisits: number;
  lastVisitDate: string;
  totalUsers: number;
  activeUsers: number;
}

// Track globally so StrictMode double-mount doesn't cause race conditions
// (Usage removed to allow flexible counting when prevention is OFF)

export function useMetrics() {
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('app_metrics')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setMetrics({
          totalVisits: Number(data.total_visits),
          todayVisits: Number(data.today_visits),
          lastVisitDate: data.last_visit_date,
          totalUsers: Number(data.total_users),
          activeUsers: Number(data.active_users),
        });
      }
    };

    // Increment logic via RPC with IP & Daily deduplication
    const incrementVisit = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        let currentIp = "unknown";
        let location = "Unknown";
        let latitude: number | null = null;
        let longitude: number | null = null;
        
        try {
          const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
          const geoData = await ipRes.json();
          currentIp = geoData.ip;
          location = `${geoData.city || 'Unknown'}, ${geoData.country || geoData.country_code || 'Unknown'}`;
          if (geoData.latitude && geoData.longitude) {
            latitude = parseFloat(geoData.latitude);
            longitude = parseFloat(geoData.longitude);
          }
        } catch (e) {
          console.warn("Could not fetch IP, falling back to local tracking only.");
        }

        // OS/Device detection for better logging
        const getOS = () => {
          const ua = navigator.userAgent;
          const isMobile = /Mobi|Android|iPhone/i.test(ua);
          let os = 'Unknown OS';
          if (/windows/i.test(ua)) os = 'Windows';
          else if (/macintosh|mac os x/i.test(ua)) os = 'Mac OS';
          else if (/linux/i.test(ua)) os = 'Linux';
          else if (/android/i.test(ua)) os = 'Android';
          else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
          
          return `${os}${isMobile ? ' (Mobile)' : ' (Desktop)'}`;
        };

        // 1. ALWAYS log the visit (regardless of toggle)
        try {
          await supabase.from('visitor_logs').insert([{
            ip_address: currentIp,
            location: location,
            latitude: latitude,
            longitude: longitude,
            user_agent: getOS(), // Log parsed OS instead of raw UA for better readable admin view
            referrer: document.referrer || 'Direct',
            visited_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn("Visitor log could not be saved.");
        }

        // 2. Fetch settings - Check if duplication prevention is toggled
        let preventDuplicate = false; // Default to OFF to ensure visits are counted if setting missing
        const { data: metricsData } = await supabase
          .from('app_metrics')
          .select('prevent_duplicate_ip')
          .eq('id', 1)
          .single();
        
        if (metricsData && metricsData.prevent_duplicate_ip !== undefined) {
           preventDuplicate = metricsData.prevent_duplicate_ip;
        }

        // 3. Conditional Increment
        const lastVisitDate = localStorage.getItem('last_visit_date');
        const lastVisitIp = localStorage.getItem('last_visit_ip');

        // IF prevention is ON, and it's same IP + same Day -> SKIP Counter
        if (preventDuplicate && lastVisitDate === today && lastVisitIp === currentIp) {
            console.log("Visit increment skipped (Duplicate IP prevention is ON)");
            fetchMetrics();
            return;
        }

        // Proceed to increment metrics in db
        await supabase.rpc('increment_page_visit');
        
        // Save today and IP locally for deduplication check next time
        localStorage.setItem('last_visit_date', today);
        localStorage.setItem('last_visit_ip', currentIp);
        
        fetchMetrics();
      } catch (err) {
        console.error("Failed to increment visit:", err);
      }
    };

    incrementVisit();
    fetchMetrics();

    // Subscribe to live metrics updates via Postgres changes
    const channel = supabase
      .channel('public:app_metrics')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_metrics' }, (payload) => {
        const newData = payload.new;
        setMetrics({
          totalVisits: Number(newData.total_visits),
          todayVisits: Number(newData.today_visits),
          lastVisitDate: newData.last_visit_date,
          totalUsers: Number(newData.total_users),
          activeUsers: Number(newData.active_users),
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return metrics;
}
