import axios from 'axios';

async function checkPhone() {
  const targetPhone = '01049990044';
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/admin/designers', {
      params: { size: 1000 }
    });
    const items = res.data.items || res.data;
    const found = items.find((d: any) => {
      const dPhone = (d.mobileNumber || '').replace(/[^0-9]/g, '');
      return dPhone === targetPhone;
    });
    console.log('Phone check for 01049990044:', found ? 'FOUND' : 'NOT FOUND');
    if (found) console.log('Existing designer:', found);
  } catch (err) {
    console.error('Error fetching designers:', err);
  }
}

checkPhone();
