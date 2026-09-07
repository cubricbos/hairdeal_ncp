const fs = require('fs');
const file = 'src/hooks/useMetrics.ts';
let content = fs.readFileSync(file, 'utf8');

const newFetchMetrics = `
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/app-metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            totalVisits: Number(data.total_visits),
            todayVisits: Number(data.today_visits),
            lastVisitDate: data.last_visit_date,
            totalUsers: Number(data.total_users),
            activeUsers: Number(data.active_users),
          });
          return data;
        }
      } catch(e) {
        console.warn('Proxy fetch for metrics failed, trying Supabase directly');
      }

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
        return data;
      }
      return null;
    };
`;

const fetchRegex = /const fetchMetrics = async \(\) => \{[\s\S]*?\};\n/m;
content = content.replace(fetchRegex, newFetchMetrics + '\n');

// Also fix deduplication and increment:
const fetchSettingsRegex = /const \{ data: metricsData \} = await supabase[\s\S]*?\.single\(\);/m;
content = content.replace(fetchSettingsRegex, 'const metricsData = await fetchMetrics();');

const incrementRpcRegex = /await supabase\.rpc\('increment_page_visit'\);/m;
const incrementReplacement = `
        try {
          await fetch('/api/app-metrics/increment', { method: 'POST' });
        } catch(e) {
          await supabase.rpc('increment_page_visit');
        }
`;
content = content.replace(incrementRpcRegex, incrementReplacement);

fs.writeFileSync(file, content);
console.log('patched useMetrics.ts');
