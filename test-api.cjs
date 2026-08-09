const axios = require('axios');
(async () => {
  try {
    // we don't have a token, but let's see if we get 401 or something
    const res = await axios.get('http://localhost:3000/api/account/designer/detail');
    console.log(res.data);
  } catch (e) {
    console.log(e.response?.status, e.response?.data);
  }
})();
