import axios from 'axios';

async function main() {
  try {
    const r = await axios.get('http://hairdeal.cubric.io/api/v3/api-docs');
    const spec = r.data;
    const dto = spec.components.schemas.UnConfirmedDesignerDto;
    console.log("UnConfirmedDesignerDto:", JSON.stringify(dto, null, 2));
  } catch(e: any) {
    console.log("Fail", e.response?.status, e.response?.data?.message || e.message);
  }
}
main();
