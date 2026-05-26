import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf-8");
const url = envStr.match(/VITE_SUPABASE_URL=(.*)/)?.[1] || "";
const key = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1] || "";

const supabase = createClient(url, key);

async function test() {
  const m = await supabase.from('ai_models').select('*');
  console.log("ai_models:", m.error?.message, m.data?.length);

  const hs = await supabase.from('hair_styles').select('*');
  console.log("hair_styles:", hs.error?.message, hs.data?.length);
  
  const hsOrderBy = await supabase.from('hair_styles').select('*').order('sort_order', {ascending: true});
  console.log("hair_styles order by sort_order:", hsOrderBy.error?.message);
}

test();
