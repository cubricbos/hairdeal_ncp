const fs = require('fs');
const file = 'src/components/Hero.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\${!hero\.titleColor \? 'text-text-dark' : ''}/g,
  "${!hero.titleColor ? 'text-white' : ''}"
);

content = content.replace(
  /\${!hero\.subtitleColor \? 'text-text-light' : ''}/g,
  "${!hero.subtitleColor ? 'text-gray-300' : ''}"
);

content = content.replace(
  /\${!hero\.metricsColor \? 'text-text-dark' : ''}/g,
  "${!hero.metricsColor ? 'text-white' : ''}"
);

content = content.replace(
  /\${!hero\.metricsColor \? 'text-text-light' : 'opacity-80'}/g,
  "${!hero.metricsColor ? 'text-gray-400' : 'opacity-80'}"
);

fs.writeFileSync(file, content);
console.log('patched Hero colors');
