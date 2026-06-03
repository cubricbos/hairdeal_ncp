import axios from 'axios';
async function test() {
  const eps = [
    { name: 'search', url: 'http://localhost:3000/api/core/admin/designers?search=01021170601' },
    { name: 'q', url: 'http://localhost:3000/api/core/admin/designers?q=01021170601' },
    { name: 'query', url: 'http://localhost:3000/api/core/admin/designers?query=01021170601' },
    { name: 'keyword', url: 'http://localhost:3000/api/core/admin/designers?keyword=01021170601' },
    { name: 'mobileNumber', url: 'http://localhost:3000/api/core/admin/designers?mobileNumber=01021170601' },
    { name: 'phone', url: 'http://localhost:3000/api/core/admin/designers?phone=01021170601' },
  ];
  for (const ep of eps) {
     try {
       const r = await axios.get(ep.url);
       const items = r.data?.items || r.data;
       console.log('Result for', ep.name, ':', items?.length);
     } catch(e) {}
  }
}
test();
