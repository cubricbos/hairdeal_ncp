const fs = require('fs');
const file = 'src/components/AiMarketingDemo.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const { settings } = useSiteContext();

  const triggerAuth = () => {`;

const replacementStr = `  const triggerAuth = () => {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Demo patched again");
} else {
  console.log("Demo string not found 2");
}
