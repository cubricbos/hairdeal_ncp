import fs from 'fs';

let content = fs.readFileSync('src/pages/AiHairModelAppPage.tsx', 'utf-8');

// Replace apiClient call with fetch call
content = content.replace(
    "const response = await apiClient.post('/faceswap/start', {\n              sourceUrl: sourceUrl,\n              targetUrl: targetUrl\n           });\n\n           const taskId = response.data?.taskId;",
    `const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
           const response = await fetch(backendUrl + '/api/faceswap/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sourceUrl, targetUrl })
           });
           if (!response.ok) throw new Error('Generation API failed');
           const data = await response.json();
           const taskId = data.taskId;`
);

content = content.replace(
    "finalImageUrl = await waitForNcpAlbumResult(initialTopImageId, apiClient, (status) => {\n                  setGeneratingStatus(\"AI 합성 진행 중...\\n이미지를 정교하게 합성하고 있습니다.\");\n              });",
    `finalImageUrl = await waitForResult(taskId, (status, queuePosition) => {
                  if (status === 'PENDING') {
                     setGeneratingStatus(queuePosition ? \`대기 상태: 대기 중\\n(대기 순번: \${queuePosition}번째)\` : \`대기 상태: 대기 중...\`);
                  } else {
                     setGeneratingStatus("AI 합성 진행 중...\\n이미지를 정교하게 합성하고 있습니다.");
                  }
              });`
);

fs.writeFileSync('src/pages/AiHairModelAppPage.tsx', content);

let content2 = fs.readFileSync('src/pages/AiHairModelPage.tsx', 'utf-8');

content2 = content2.replace(
    "const response = await apiClient.post('/faceswap/start', {\n              sourceUrl: sourceUrl,\n              targetUrl: targetUrl\n           });\n\n           const taskId = response.data?.taskId;",
    `const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
           const response = await fetch(backendUrl + '/api/faceswap/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sourceUrl, targetUrl })
           });
           if (!response.ok) throw new Error('Generation API failed');
           const data = await response.json();
           const taskId = data.taskId;`
);

content2 = content2.replace(
    "finalImageUrl = await waitForNcpAlbumResult(initialTopImageId, apiClient, (status) => {\n                  setGeneratingStatus(\"AI 합성 진행 중...\\n이미지를 정교하게 합성하고 있습니다.\");\n              });",
    `finalImageUrl = await waitForResult(taskId, (status, queuePosition) => {
                  if (status === 'PENDING') {
                     setGeneratingStatus(queuePosition ? \`대기 상태: 대기 중\\n(대기 순번: \${queuePosition}번째)\` : \`대기 상태: 대기 중...\`);
                  } else {
                     setGeneratingStatus("AI 합성 진행 중...\\n이미지를 정교하게 합성하고 있습니다.");
                  }
              });`
);

fs.writeFileSync('src/pages/AiHairModelPage.tsx', content2);
