const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<button\n                    onClick={addFeatureItem}',
  '<button\n                    type="button"\n                    onClick={addFeatureItem}'
);

content = content.replace(
  'onClick={() => onDelete(idx)}\n                  className="p-2 text-gray-400',
  'type="button"\n                  onClick={() => onDelete(idx)}\n                  className="p-2 text-gray-400'
);

content = content.replace(
  '<button\n                className="w-12 h-12 bg-white rounded-xl',
  '<button\n                type="button"\n                className="w-12 h-12 bg-white rounded-xl'
);

fs.writeFileSync(file, content);
console.log('patched buttons');
