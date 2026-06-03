import axios from 'axios';
import FormData from 'form-data';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const form = new FormData();
  form.append('name', 'Form Test');
  form.append('email', `form${Date.now()}@example.com`);
  form.append('password', 'Password123!');
  form.append('passwordConfirm', 'Password123!');
  form.append('mobileNumber', '01099998888');
  form.append('role', '디자이너');

  try {
    console.log('Testing payload with FormData...');
    const res = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      }
    });
    console.log('SUCCESS:', res.status, res.data);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
