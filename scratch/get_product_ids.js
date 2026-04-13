const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getProductIds() {
  console.log("Fetching product IDs...");
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  console.log("PRODUCT_LIST_START");
  console.log(JSON.stringify(data, null, 2));
  console.log("PRODUCT_LIST_END");
}

getProductIds();
