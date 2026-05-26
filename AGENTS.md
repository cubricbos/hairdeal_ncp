# Project-Specific Rules

## Supabase Data Fetching
- **Retry Logic (Network Drops):** Always implement a retry mechanism (e.g., up to 3 attempts with progressive delay) when making `supabase.from(...).select(...)` calls to handle transient network drops.
- **Robust Fallbacks:** If a query fails due to specific clauses (like `.order('sort_order', { ascending: true })` failing because the column is missing), explicitly catch this and fall back to a basic `select('*')` query without the strict ordering/filtering.
- **Component Lifecycle (isMounted):** When fetching data asynchronously in `useEffect`, always include an `isMounted` flag (e.g., `let isMounted = true; ... return () => { isMounted = false; }`) to prevent React state updates on unmounted components after a delayed retry completes.
- **Default Presets:** If all retry attempts and fallback queries fail, explicitly set state to an application-defined DEFAULT_PRESET constant to ensure the UI does not crash or infinite-load.
