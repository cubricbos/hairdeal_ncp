import axios from 'axios';

async function main() {
  const id = 'd2c289a28d76425894adaec4d9e9820a'; 
  const eps = [
    `http://hairdeal.cubric.io/api/designer/${id}`,
    `http://hairdeal.cubric.io/api/designer?designerId=${id}`,
    `http://hairdeal.cubric.io/api/designer/profile?designerId=${id}`,
    `http://account.cubric.io/api/designer/profile?designerId=${id}`,
    `http://account.cubric.io/api/designer/${id}`,
    `http://account.cubric.io/api/designer?designerId=${id}`
  ];

  for(let ep of eps) {
    try {
      const r = await axios.get(ep);
      console.log(`Success ${ep}:`, Object.keys(r.data));
    } catch(e:any) {
      console.log(`Fail ${ep}:`, e.response?.status);
    }
  }
}
main();
