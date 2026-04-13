import { supabaseAdmin } from '../src/lib/supabase-admin';

async function listUsers() {
  // Check auth.users via admin client if possible, 
  // but usually we can check a 'customers' or 'profiles' table first
  console.log('--- Email list in customers table ---');
  const { data: customers, error: custError } = await supabaseAdmin
    .from('customers')
    .select('email, name')
    .limit(10);
  
  if (custError) {
    console.error('Error fetching customers:', custError);
  } else {
    console.log(customers);
  }

  console.log('\n--- Email list in orders table (unique) ---');
  const { data: orders, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('user_email')
    .limit(50);

  if (orderError) {
    console.error('Error fetching orders:', orderError);
  } else {
    const uniqueEmails = Array.from(new Set(orders.map(o => o.user_email)));
    console.log(uniqueEmails);
  }
}

listUsers();
