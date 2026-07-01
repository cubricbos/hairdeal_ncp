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

export const toStorageUrl = (fileName: string): string => {
  if (!fileName) return '';
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
  if (!fileName.includes('.')) {
    return `https://api.cubric.io/api/storage?fileName=${fileName}.jpeg`;
  }
  return `https://api.cubric.io/api/storage?fileName=${fileName}`;
};

export const getFileStorageName = (file: any): string => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  if (file.savedFileName) return file.savedFileName;
  if (file.savedPath) return file.savedPath;
  if (file.fileName) return file.fileName;
  if (file.thumbNailPath) return file.thumbNailPath;
  if (file.path) return file.path;
  if (file.url) return file.url;
  if (Array.isArray(file.details) && file.details.length > 0) {
    return file.details[0];
  }
  return file.id || file.fileId || file.file_id || '';
};

export const getNcpImageUrl = (item: any): string => {
  if (!item) return '';
  
  if (item.file) {
    const storageName = getFileStorageName(item.file);
    if (storageName) {
      return toStorageUrl(storageName);
    }
  }
  
  const directUrl = item.url || item.imageUrl || item.image_url;
  if (directUrl) return directUrl;
  
  if (item.uid) {
    return toStorageUrl(item.uid);
  }
  if (item.id) {
    return toStorageUrl(item.id.toString());
  }
  
  return '';
};

let workingPattern: string | null = null;

const checkTaskStatus = async (apiClient: any, taskId: string): Promise<{ status: string | null; resultUrl: string | null }> => {
  const candidates = [
    `/faceswap/task/${taskId}`,
    `/faceswap/status/${taskId}`,
    `/faceswap/task?taskId=${taskId}`,
    `/faceswap/status?taskId=${taskId}`,
    `/faceswap/queue/${taskId}`
  ];
  
  if (workingPattern) {
    const url = workingPattern.replace('{taskId}', taskId);
    try {
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      return {
        status: (data?.status || data?.taskStatus || data?.jobStatus || '').toString().toUpperCase() || null,
        resultUrl: data?.resultUrl || data?.outputUrl || data?.imageUrl || data?.url || null
      };
    } catch {
      // If working pattern fails, reset and retry candidates
      workingPattern = null;
    }
  }
  
  for (const rawRaw of candidates) {
    try {
      const res = await apiClient.get(rawRaw);
      if (res.status === 200) {
        const data = res.data?.data || res.data;
        if (data) {
          workingPattern = rawRaw.includes('?') ? rawRaw.split('?')[0] + '?taskId={taskId}' : rawRaw.replace(taskId, '{taskId}');
          return {
            status: (data?.status || data?.taskStatus || data?.jobStatus || '').toString().toUpperCase() || null,
            resultUrl: data?.resultUrl || data?.outputUrl || data?.imageUrl || data?.url || null
          };
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        const data = err.response?.data?.data || err.response?.data;
        if (data && (data.status || data.taskStatus)) {
          return {
            status: (data.status || data.taskStatus).toString().toUpperCase(),
            resultUrl: data.resultUrl || data.outputUrl || data.imageUrl || null
          };
        }
      }
    }
  }
  
  return { status: null, resultUrl: null };
};

export const waitForNcpAlbumResult = async (
   initialTopImageId: string | null,
   apiClient: any,
   onProgress?: (status: string) => void,
   taskId?: string | null
): Promise<string> => {
   const MAX_ATTEMPTS = 300; // Up to 10 minutes
   let attempts = 0;

   let baselineId = initialTopImageId;

   // If the caller didn't manage to retrieve a baseline ID, try to query it now
   // so that we don't treat old existing items in the album as new results.
   if (!baselineId) {
      try {
         const initRes = await apiClient.get('/faceswap/album', { params: { page: 0, size: 5 } });
         const initItems = initRes.data?.data?.content || initRes.data?.content || initRes.data?.data?.items || initRes.data?.items || [];
         if (initItems && initItems.length > 0) {
            baselineId = initItems[0].uid || initItems[0].id;
            console.log("Established active baseline top image ID for polling:", baselineId);
         }
      } catch (err) {
         console.warn("Could not establish active baseline top image ID:", err);
      }
   }

   while(attempts < MAX_ATTEMPTS) {
      if (taskId) {
         try {
            const taskInfo = await checkTaskStatus(apiClient, taskId);
            if (taskInfo.status) {
               console.log(`[Task Check] Task ${taskId} status is: ${taskInfo.status}`);
               if (taskInfo.status === 'QUEUED') {
                  if (onProgress) onProgress('QUEUED');
               } else if (taskInfo.status === 'PROCESSING') {
                  if (onProgress) onProgress('PROCESSING');
               } else if (taskInfo.status === 'COMPLETED') {
                  if (taskInfo.resultUrl) {
                     return taskInfo.resultUrl;
                  }
                  // Fallthrough to standard album check if url is missing
               } else if (taskInfo.status === 'FAILED') {
                  throw new Error("AI 윤곽 수신 실패: 얼굴 각도 또는 조명이 모델과 일치하지 않아 완료할 수 없습니다.");
               } else if (taskInfo.status === 'CANCELLED') {
                  throw new Error("AI 합성 작업이 취소되었습니다.");
               }
            }
         } catch (chkErr: any) {
            if (chkErr.message && chkErr.message.includes("실패") || chkErr.message.includes("취소")) {
               throw chkErr; // Escalate known operational errors instantly
            }
            console.warn("Error checking task status:", chkErr);
         }
      }

      if (onProgress) {
         onProgress('PROCESSING');
      }
      
      try {
          const res = await apiClient.get('/faceswap/album', { params: { page: 0, size: 5 } });
          const items = res.data?.data?.content || res.data?.content || res.data?.data?.items || res.data?.items || [];
          if (items && items.length > 0) {
             const latestImage = items[0];
             const latestId = latestImage.uid || latestImage.id;
             // If baselineId was empty/null (empty album) and we finally got an item, return it.
             // If baselineId is set, wait until latestId is different from baselineId.
             if (!baselineId || latestId !== baselineId) {
                const finalUrl = getNcpImageUrl(latestImage);
                if (finalUrl) {
                   return finalUrl;
                }
             }
          }
      } catch (err) {
          console.warn("Error polling album:", err);
      }
      
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
   }
   throw new Error("처리 시간이 초과되었습니다. 앨범에서 결과물을 확인해주세요.");
};
