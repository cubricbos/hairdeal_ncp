import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          // Avoid scanning huge system and node directories
          const skipDirs = [
            'node_modules', '.next', 'dist', '.git', 'sys', 'proc', 'dev', 'run', 
            'etc', 'var', 'lib', 'usr', 'bin', 'sbin', 'boot', 'lib64', 'media', 'mnt', 'srv', 'opt'
          ];
          if (!skipDirs.includes(file)) {
            results = results.concat(walk(filePath));
          }
        } else {
          if (file.endsWith('.kt') || file.endsWith('.java') || file.toLowerCase().includes('controller') || file.toLowerCase().includes('swap')) {
            results.push(filePath);
          }
        }
      } catch (err) {
        // Safe skip on permission errors
      }
    });
  } catch (err) {
    // Safe skip on read errors
  }
  return results;
}

try {
  const found = walk('/');
  console.log('Absolutely found files in /:', found);
} catch (e) {
  console.log('Error walking directories:', e.message);
}

