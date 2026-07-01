const d = new Date("2025-10-13T08:00:00Z");
console.log("UTC:", d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }));
console.log("KST:", d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }));
