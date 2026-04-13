import { supabaseAdmin } from './lib/supabase-admin';

async function checkCouponsTable() {
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Coupons table might be missing:', error.message);
  } else {
    console.log('Coupons table EXISTS. Columns:', Object.keys(data[0] || {}));
  }
}

checkCouponsTable();
