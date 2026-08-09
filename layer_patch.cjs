const fs = require('fs');
const file = 'src/components/LayerSection.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                          if (layer.primaryBtnLink === '#') window.dispatchEvent(new CustomEvent('open-auth'));
                          else window.location.href = layer.primaryBtnLink || '#';`;

const replacementStr = `                          if (layer.primaryBtnLink === '#') {
                            const action = settings.nav?.primaryBtnAction || 'modal';
                            const target = settings.nav?.primaryBtnTarget || 'auth';
                            if (action === 'modal') {
                              if (target === 'auth') window.dispatchEvent(new CustomEvent('open-auth'));
                              else if (target === 'inquiry') window.dispatchEvent(new CustomEvent('open-inquiry'));
                            } else if (action === 'section') {
                              const el = document.getElementById(target.replace('#', ''));
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            } else if (action === 'link') {
                              if (target.startsWith('http')) window.open(target, '_blank');
                              else window.location.href = target;
                            }
                          } else window.location.href = layer.primaryBtnLink || '#';`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Layer patched");
} else {
  console.log("Layer string not found");
}
