const fs = require('fs');
const file = 'src/components/AiMarketingDemo.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const triggerAuth = () => {
    if (user) return;
    window.dispatchEvent(new CustomEvent('open-auth'));
  };`;

const replacementStr = `  const { settings } = useSiteContext();

  const triggerAuth = () => {
    if (user) return;
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
  };`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Demo patched");
} else {
  console.log("Demo string not found");
}
