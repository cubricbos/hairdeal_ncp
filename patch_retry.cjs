const fs = require('fs');
const file = 'src/lib/supabase-utils.ts';
let content = fs.readFileSync(file, 'utf8');

const buggyRetry = `export async function retrySupabaseSelect<T>(
  queryFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>> {
  return retryPromise(queryFn, maxAttempts, delayMs);
}`;

const fixedRetry = `export async function retrySupabaseSelect<T>(
  queryFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>> {
  return retryPromise(queryFn, maxAttempts, delayMs, (res: any) => {
    if (!res.error) return false;
    
    const code = res.error.code;
    const msg = res.error.message || '';
    
    // Do not retry on Auth errors, Missing Rows, or Missing Tables
    if (code === 'PGRST116' || code === '42P01' || code === '42501' || msg.includes('JWT') || msg.includes('key') || msg.includes('Failed to fetch')) {
      return false;
    }
    
    return true; // Retry on actual transient errors
  });
}`;

if (content.includes('return retryPromise(queryFn, maxAttempts, delayMs);')) {
  content = content.replace(buggyRetry, fixedRetry);
  fs.writeFileSync(file, content);
  console.log('patched retry logic');
} else {
  console.log('could not find string to replace');
}
