const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://Yzdtnlfkyklfgcvyjigcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_lHn2QSvG2IFMrPccC5eQnQ_aLx_73tZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.log('Error fetching profiles:', profilesError.message);
  } else {
    console.log('Profiles:', profiles);
  }
  
  // Test transactions
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (txError) {
    console.log('Error fetching transactions:', txError.message);
  } else {
    console.log('Transactions:', transactions);
  }
}

testConnection();
