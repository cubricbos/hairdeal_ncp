import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * Retries a generic promise-returning function with progressive delay.
 */
export async function retryPromise<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
  errorCheck: (res: T) => boolean = (res: any) => !!res.error
): Promise<T> {
  let lastResult: T | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (!errorCheck(result)) {
        return result;
      }
      lastResult = result;
      console.warn(`[Retry] Attempt ${attempt} failed with error:`, (result as any).error?.message || (result as any).error);
    } catch (err) {
      console.warn(`[Retry] Attempt ${attempt} caught exception:`, err);
      if (attempt === maxAttempts) throw err;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  return lastResult!;
}

/**
 * Retries a Supabase query with progressive delay.
 */
export async function retrySupabaseSelect<T>(
  queryFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>> {
  return retryPromise(queryFn, maxAttempts, delayMs);
}

/**
 * Handles the sort_order column missing fallback as per AGENTS.md
 */
export async function safeSelectWithOrderFallback<T>(
  table: any,
  select: string = '*',
  orderColumn: string = 'sort_order',
  filterFn?: (query: any) => any
) {
  // Attempt with ordering
  const baseQuery = () => {
    let q = table.select(select);
    if (filterFn) q = filterFn(q);
    return q.order(orderColumn, { ascending: true });
  };
  
  const result = await retrySupabaseSelect<T>(baseQuery as any);
  
  // If failed specifically because the column is missing
  if (result.error && (result.error.message?.includes('column') || (result.error as any).code === '42703')) {
    console.warn(`[Supabase Fallback] '${orderColumn}' missing, falling back to basic select.`);
    const fallbackQuery = () => {
      let q = table.select(select);
      if (filterFn) q = filterFn(q);
      return q;
    };
    return await retrySupabaseSelect<T>(fallbackQuery as any);
  }
  
  return result;
}
