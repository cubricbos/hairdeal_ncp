import axios from 'axios';

async function listAll() {
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/admin/designers', {
      params: { size: 1000 }
    });
    const items = res.data.items || res.data;
    console.log('Total items found:', items.length);
    items.forEach((d: any, i: number) => {
      console.log(`${i+1}. Name: ${d.name}, Email: ${d.email}, AccountID: ${d.accountId}, ID: ${d.id}`);
    });
  } catch (err) {
    console.error(err);
  }
}

listAll();
