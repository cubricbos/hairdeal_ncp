import { useState } from 'react';
import { apiClient, accountClient } from '../../lib/ncpClient';

export default function TestPage() {
  const [log, setLog] = useState('');

  const runTest = async () => {
      let output = '';
      const testCases = [
          {
            payload: {
                shopName: "내샵",
                shopNumber: "010-1234-5678",
                addressDetail: "1층",
                address: {
                    sido: "", sigungu: "", bname: "", address: "서울", roadAddress: "서울", zonecode: "", latitude: 0, longitude: 0
                },
                businessTimes: [null, null, null, null, null, null, null],
                holidays: []
            },
            name: "basic"
          },
          {
            payload: {
                shopName: "내샵",
                shopNumber: "010-1234-5678",
                addressDetail: "1층",
                address: {
                    sido: "", sigungu: "", bname: "", address: "서울", roadAddress: "서울", zoneCode: "", latitude: 0, longitude: 0
                },
                businessTimes: [null, null, null, null, null, null, null],
                holidays: []
            },
            name: "zoneCode (camelCase)"
          },
          {
             payload: {
                shopName: "내샵",
                shopNumber: "010-1234-5678",
                addressDetail: "1층",
                address: {
                    sido: "", sigungu: "", bname: "", address: "서울", roadAddress: "서울", zonecode: "", location: { latitude: 0, longitude: 0}
                },
                businessTimes: [null, null, null, null, null, null, null],
                holidays: []
            },
            name: "location object nested"
          },
          {
             payload: {
                hairShop: {
                    name: "내샵",
                    number: "010-1234-5678",
                    addressDetail: "1층",
                    sido: "", sigungu: "", bname: "", address: "서울", roadAddress: "서울", zonecode: "", location: { latitude: 0, longitude: 0}
                },
                businessTimes: [null, null, null, null, null, null, null],
                holidays: []
            },
            name: "hairShop object"
          }
      ];

      for (const t of testCases) {
          try {
              output += `Testing Core: ${t.name}\n`;
              const res = await apiClient.post('/designer/management', t.payload);
              output += `Core Success: ${res.status}\n`;
          } catch(e:any) {
              output += `Core Fail: ${JSON.stringify(e.response?.data)}\n`;
          }
      }

      setLog(output);
  };

  return (
    <div className="p-10">
       <button onClick={runTest} className="bg-blue-500 text-white p-2 rounded">Test</button>
       <pre className="mt-4 border p-4 text-xs">{log}</pre>
    </div>
  );
}
