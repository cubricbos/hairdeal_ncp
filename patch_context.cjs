const fs = require('fs');
const file = 'src/context/SiteContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      try {
        let data = null;
        let error = null;
        
        try {
          // 1. Try our backend proxy first to bypass browser CORS
          const res = await fetch('/api/site-settings');
          if (res.ok) {
            data = await res.json();
          } else {
            throw new Error('Proxy failed');
          }
        } catch (proxyErr) {
          console.warn('Proxy fetch failed, falling back to direct Supabase request:', proxyErr);
          // 2. Fallback to direct supabase select
          const result = await retrySupabaseSelect(() => supabase
            .from('site_settings')
            .select('*')
            .eq('id', 'default')
            .single() as any);
          data = result.data;
          error = result.error;
        }
        
        if (data && !error) {`;

// Replace from 'try {' down to 'if (data && !error) {'
const startIdx = content.indexOf('try {\n        const { data, error }');
const endIdx = content.indexOf('if (data && !error) {', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + replacement.trim() + ' {' + content.substring(endIdx + 21);
  fs.writeFileSync(file, content);
  console.log('patched SiteContext.tsx');
} else {
  console.log('Failed to patch SiteContext.tsx');
}
