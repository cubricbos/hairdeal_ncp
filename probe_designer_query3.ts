import axios from 'axios';
async function run() {
  const p = [
    { target: "01077589591" },
    { keyword: "01077589591" },
    { search: "01077589591" },
    { phone: "01077589591" },
    { name: "01077589591" }
  ];
  for (const q of p) {
    try {
      const res = await axios.get('http://localhost:3000/api/core/admin/designers', { params: q });
      console.log("OK querying with", q, "-> items length:", res.data.items?.length);
    } catch(e:any) {
      console.log("FAIL", q, e.message);
    }
  }
}
run();
