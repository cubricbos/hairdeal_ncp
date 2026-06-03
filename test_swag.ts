import axios from 'axios';
async function test() {
  try {
      const v = await axios.get(`http://43.203.235.158:8080/v3/api-docs`);
      const paths = Object.keys(v.data.paths).filter(p => p.includes('designer'));
      console.log('paths:', paths);
      for (const p of paths) {
         console.log(p, JSON.stringify(v.data.paths[p], null, 2));
      }
      const ref = v.data.paths['/api/designer']?.post?.requestBody?.content['application/json']?.schema?.$ref;
      if (ref) {
         const s = ref.split('/').pop();
         console.log("Designer POST schema:", JSON.stringify(v.data.components.schemas[s], null, 2));
      }
  } catch(e: any) { console.log(e.message) }
}
test();
