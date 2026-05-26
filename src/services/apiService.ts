import { supabase } from '../supabase';

export const uploadToStorage = async (fileOrBase64: File | string, pathPrefix: string): Promise<string> => {
  let file: File | Blob;
  let fileExt = 'jpg';
  
  if (typeof fileOrBase64 === 'string') {
     if (fileOrBase64.startsWith('http')) return fileOrBase64;
     
     const arr = fileOrBase64.split(',');
     const mimeMatch = arr[0].match(/:(.*?);/);
     const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
     fileExt = mimeType.split('/')[1] || 'jpg';
     const bstr = atob(arr[1] || arr[0]);
     let n = bstr.length;
     const u8arr = new Uint8Array(n);
     while(n--){
       u8arr[n] = bstr.charCodeAt(n);
     }
     file = new Blob([u8arr], {type: mimeType});
  } else {
     file = fileOrBase64;
     fileExt = (file as File).name?.split('.').pop() || 'jpg';
  }

  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${pathPrefix}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('models')
    .upload(filePath, file);

  if (uploadError) {
     console.error("Storage upload error:", uploadError);
     throw new Error(`업로드 실패: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('models')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const waitForResult = async (taskId: string): Promise<string> => {
   const MAX_ATTEMPTS = 60; // Up to 120 seconds
   let attempts = 0;
   
   const backendUrl = import.meta.env.VITE_BACKEND_URL;
   const apiKey = import.meta.env.VITE_FACESWAP_API_KEY;

   if (!backendUrl || !apiKey) {
      throw new Error(".env 파일에 VITE_BACKEND_URL 또는 VITE_FACESWAP_API_KEY 가 설정되지 않았습니다.");
   }

   while(attempts < MAX_ATTEMPTS) {
      const response = await fetch(`${backendUrl}/api/faceswap/status?taskId=${taskId}`, {
         headers: {
            'X-Api-Key': apiKey
         }
      }).catch(err => {
         if (err.message === 'Failed to fetch') {
            throw new Error('네트워크 연결 오류: 상태 확인 API에 접근할 수 없습니다.');
         }
         throw err;
      });
      
      const data = await response.json();
      
      if (data.status === 'COMPLETED' || data.status === 'SUCCESS') {
         // Some APIs return 'result_url', some might return 'output', 'resultUrl', etc.
         return data.resultUrl || data.result_url || data.output || data.result;
      } else if (data.status === 'FAILED' || data.status === 'ERROR') {
         throw new Error("처리 중 실패했습니다: " + data.message);
      }
      
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
   }
   throw new Error("시간이 초과되었습니다.");
};
