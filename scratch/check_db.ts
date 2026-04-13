import { supabaseAdmin } from "../src/lib/supabase-admin";

async function checkTable() {
  const { error } = await supabaseAdmin.from("coupons").select("*").limit(1);
  if (error) {
    console.log("Table check error:", error.message);
    if (error.message.includes("relation \"public.coupons\" does not exist")) {
      console.log("CRITICAL: Table 'coupons' is missing!");
    }
  } else {
    console.log("Table 'coupons' exists and is accessible.");
  }
}

checkTable();
