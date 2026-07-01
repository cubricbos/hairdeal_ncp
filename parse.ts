import * as fs from 'fs';

try {
  let fileData = fs.readFileSync('swagger.json', 'utf8');
  let data;
  if(fileData.trim().startsWith('[')) {
      data = { paths: {} }; 
  } else {
      data = JSON.parse(fileData);
  }
  
  const targetPaths = Object.keys(data.paths || {}).filter(p => p.includes('management'));
  if (targetPaths.length > 0) {
      targetPaths.forEach(p => {
          console.log(p);
          console.log(JSON.stringify(data.paths[p], null, 2));
      });
  } else {
     console.log('Not in swagger.json, trying core-swagger.json...');
     try {
       const cd = JSON.parse(fs.readFileSync('core-swagger.json', 'utf8'));
       const ctp = Object.keys(cd.paths || {}).filter(p => p.includes('management'));
       ctp.forEach(p => {
          console.log(p);
          console.log(JSON.stringify(cd.paths[p], null, 2));
       });
     } catch(e) {
       console.log('no core-swagger.json');
     }
  }
} catch(e) { console.error(e); }
