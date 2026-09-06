const fs = require('fs');
const file = 'src/lib/supabase-utils.ts';
let content = fs.readFileSync(file, 'utf8');

const buggyCatch = `    } catch (err) {
      console.warn(\`[Retry] Attempt \${attempt} caught exception:\`, err);
      if (attempt === maxAttempts) throw err;
    }`;

const fixedCatch = `    } catch (err: any) {
      console.warn(\`[Retry] Attempt \${attempt} caught exception:\`, err);
      if (err?.message === 'Failed to fetch' || err?.message?.includes('network') || attempt === maxAttempts) {
        throw err;
      }
    }`;

content = content.replace(buggyCatch, fixedCatch);
fs.writeFileSync(file, content);
console.log('patched catch block');
