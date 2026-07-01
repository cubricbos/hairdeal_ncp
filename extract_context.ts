import fs from 'fs';

function run() {
  const fileContent = fs.readFileSync('./dist/assets/index-D7h93c5U.js', 'utf-8');
  let index = fileContent.indexOf('/designer/management');
  
  while (index !== -1) {
    console.log(`\n================ MATCH FOUND AT CHARACTER INDEX: ${index} ================`);
    const start = Math.max(0, index - 500);
    const end = Math.min(fileContent.length, index + 500);
    console.log(fileContent.substring(start, end));
    
    index = fileContent.indexOf('/designer/management', index + 1);
  }
}

run();
