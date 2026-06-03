import axios from 'axios';

async function checkEmail() {
  const targetEmail = 'tyhanareum@gmail.com';
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/admin/designers', {
      params: { size: 1000 }
    });
    const items = res.data.items || res.data;
    const found = items.find((d: any) => {
      const dEmail = (d.email || d.accountId || d.id || '').toLowerCase();
      return dEmail === targetEmail.toLowerCase();
    });
    console.log('Email check for tyhanareum@gmail.com:', found ? 'FOUND' : 'NOT FOUND');
    if (found) console.log('Existing designer:', found);
  } catch (err) {
    console.error('Error fetching designers:', err);
  }
}

checkEmail();
