const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://psmzhucjvmqbcqnikqxk.supabase.co';
const supabaseAnonKey = 'sb_publishable_IVl2ZxT62c2yxgc1OLgMSQ_jiX_3WNH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const defaultSiteSettings = {
  hero: { title: 'Default Hero Title' },
  features: { items: [ { id: '1' } ] }
};

async function test() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
  const merged = { ...defaultSiteSettings };
  const d = data;
  const legacy = d.settings || {};
  const keys = ['hero', 'features'];
  
  keys.forEach(key => {
    let val = d[key] ?? legacy[key];
    if (val !== undefined && val !== null) {
      if (merged[key] && typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
        merged[key] = { ...merged[key], ...val };
      } else {
        merged[key] = val;
      }
    }
  });

  console.log('Merged Hero:', merged.hero.title);
}
test();
