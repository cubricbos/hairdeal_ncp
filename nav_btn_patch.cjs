const fs = require('fs');
const file = 'src/components/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original button code
const targetStr = `              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                  className="bg-brand-primary text-white px-7 py-3 rounded-full text-sm font-[700] hover:shadow-lg transition-all"
                >
                  무료 시작하기
                </motion.button>
              )`;

const replacementStr = `              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    const action = nav.primaryBtnAction || 'modal';
                    const target = nav.primaryBtnTarget || 'auth';
                    if (action === 'modal') {
                      if (target === 'auth') window.dispatchEvent(new CustomEvent('open-auth'));
                      else if (target === 'inquiry') window.dispatchEvent(new CustomEvent('open-inquiry'));
                    } else if (action === 'section') {
                      const el = document.getElementById(target.replace('#', ''));
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else if (action === 'link') {
                      if (target.startsWith('http')) window.open(target, '_blank');
                      else navigate(target);
                    }
                  }}
                  className="bg-brand-primary text-white px-7 py-3 rounded-full text-sm font-[700] hover:shadow-lg transition-all"
                >
                  {nav.primaryBtnText || '무료 시작하기'}
                </motion.button>
              )`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Navbar button patched successfully");
} else {
  console.log("Could not find the Navbar button target string");
}
