import { supabaseAdmin } from './lib/supabase-admin';

async function checkSchema() {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching schema:', error);
  } else {
    console.log('Ticket Schema:', Object.keys(data[0] || {}));
  }
}

checkSchema();
