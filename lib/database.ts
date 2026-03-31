import { createClient } from '@supabase/supabase-js';
import type { Profile, Transaction, Balance } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let lastSupabaseFailure = 0;
const RETRY_DELAY_MS = 5000;

export function isSupabaseConnected(): boolean {
  return supabase !== null && canConnectToSupabase();
}

function canConnectToSupabase(): boolean {
  if (lastSupabaseFailure === 0) return true;
  return Date.now() - lastSupabaseFailure > RETRY_DELAY_MS;
}

// Sync localStorage transactions to Supabase when connection is restored
export async function syncLocalStorageToSupabase(): Promise<void> {
  if (!supabase) return;
  
  try {
    const stored = localStorage.getItem('family_app_transactions');
    if (!stored) return;
    
    const transactions: Transaction[] = JSON.parse(stored);
    if (transactions.length === 0) return;
    
    const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    // Filter out transactions with non-UUID profiles (e.g., fallback profiles "1" and "2")
    const validTransactions = transactions.filter(
      tx => isValidUuid(tx.from_profile_id) && isValidUuid(tx.to_profile_id)
    );

    if (validTransactions.length === 0) {
      console.log('[DB] No valid UUID transactions to sync, clearing localStorage');
      localStorage.removeItem('family_app_transactions');
      return;
    }

    console.log('[DB] Syncing', validTransactions.length, 'valid transactions from localStorage to Supabase');
    
    // Insert transactions in batches to avoid potential limits
    const batchSize = 20;
    for (let i = 0; i < validTransactions.length; i += batchSize) {
      const batch = validTransactions.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('transactions')
        .insert(
          batch.map(tx => ({
            from_profile_id: tx.from_profile_id,
            to_profile_id: tx.to_profile_id,
            amount: tx.amount,
            created_at: tx.created_at
          }))
        );
      
      if (error) {
        console.error('[DB] Supabase batch insert error:', error);
        lastSupabaseFailure = Date.now();
        throw error;
      }
    }
    
    // Clear localStorage after successful sync
    localStorage.removeItem('family_app_transactions');
    console.log('[DB] Successfully synced and cleared localStorage transactions');
  } catch (err) {
    console.error('[DB] Exception syncing localStorage to Supabase:', err);
    lastSupabaseFailure = Date.now();
    throw err;
  }
}

export async function getProfiles(): Promise<Profile[]> {
  console.log('[DB] getProfiles called, supabase:', !!supabase, 'canConnect:', canConnectToSupabase());
  
  if (!supabase || !canConnectToSupabase()) {
    console.log('[DB] Using fallback profiles (hardcoded)');
    return [
      { id: '1', name: 'K.A', emoji: '🐻‍❄️', color: '#3b82f6', created_at: '' },
      { id: '2', name: 'E.S', emoji: '🐻', color: '#ec4899', created_at: '' },
    ];
  }
  
  try {
    console.log('[DB] Fetching profiles from Supabase...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('[DB] Supabase error (profiles):', error);
      lastSupabaseFailure = Date.now();
      throw error;
    }
    console.log('[DB] Got profiles from Supabase:', data?.length);
    return data ?? [];
  } catch (err) {
    console.error('[DB] Exception fetching profiles:', err);
    lastSupabaseFailure = Date.now();
    return [
      { id: '1', name: 'K.A', emoji: '🐻‍❄️', color: '#3b82f6', created_at: '' },
      { id: '2', name: 'E.S', emoji: '🐻', color: '#ec4899', created_at: '' },
    ];
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  console.log('[DB] getAllTransactions called, supabase:', !!supabase, 'canConnect:', canConnectToSupabase());
  
  if (!supabase || !canConnectToSupabase()) {
    const stored = localStorage.getItem('family_app_transactions');
    console.log('[DB] Using localStorage fallback, stored:', stored ? 'YES' : 'NO');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    console.log('[DB] Fetching transactions from Supabase...');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[DB] Supabase error (transactions):', error);
      lastSupabaseFailure = Date.now();
      throw error;
    }
    console.log('[DB] Got transactions from Supabase:', data?.length);
    return data ?? [];
  } catch (err) {
    console.error('[DB] Exception fetching transactions:', err);
    lastSupabaseFailure = Date.now();
    const stored = localStorage.getItem('family_app_transactions');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createTransaction(
  fromProfileId: string,
  toProfileId: string,
  amount: number
): Promise<void> {
  console.log('[DB] createTransaction called, supabase:', !!supabase, 'canConnect:', canConnectToSupabase());
  
  if (!supabase || !canConnectToSupabase()) {
    console.log('[DB] Saving to localStorage fallback (NOT SYNCED!)');
    const stored = localStorage.getItem('family_app_transactions');
    const transactions: Transaction[] = stored ? JSON.parse(stored) : [];
    transactions.push({
      id: Date.now().toString(),
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      amount,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('family_app_transactions', JSON.stringify(transactions));
    return;
  }

  try {
    console.log('[DB] Inserting transaction to Supabase...');
    const { error } = await supabase.from('transactions').insert({
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      amount,
    });
    
    if (error) {
      console.error('[DB] Supabase insert error:', error);
      lastSupabaseFailure = Date.now();
      throw error;
    }
    console.log('[DB] Transaction saved to Supabase successfully');
  } catch (err) {
    console.error('[DB] Exception creating transaction:', err);
    lastSupabaseFailure = Date.now();
    const stored = localStorage.getItem('family_app_transactions');
    const transactions: Transaction[] = stored ? JSON.parse(stored) : [];
    transactions.push({
      id: Date.now().toString(),
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      amount,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('family_app_transactions', JSON.stringify(transactions));
  }
}

export function calculateBalance(
  profiles: Profile[],
  transactions: Transaction[]
): Balance | null {
  if (profiles.length < 2) return null;
  
  const [profileA, profileB] = profiles;
  let net = 0;
  
  for (const tx of transactions) {
    if (tx.from_profile_id === profileA.id) net += Number(tx.amount);
    if (tx.from_profile_id === profileB.id) net -= Number(tx.amount);
  }
  
  if (net === 0) {
    return { debtor: profileA, creditor: profileB, amount: 0 };
  } else if (net > 0) {
    return { debtor: profileA, creditor: profileB, amount: net };
  } else {
    return { debtor: profileB, creditor: profileA, amount: Math.abs(net) };
  }
}
