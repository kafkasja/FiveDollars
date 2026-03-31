import { createClient } from '@supabase/supabase-js';
import type { Profile, Transaction, Balance } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let supabaseFailed = false;

export async function getProfiles(): Promise<Profile[]> {
  if (!supabase || supabaseFailed) {
    return [
      { id: '1', name: 'K.A', emoji: '🐻‍❄️', color: '#3b82f6', created_at: '' },
      { id: '2', name: 'E.S', emoji: '🐻', color: '#ec4899', created_at: '' },
    ];
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      supabaseFailed = true;
      throw error;
    }
    return data ?? [];
  } catch {
    supabaseFailed = true;
    return [
      { id: '1', name: 'K.A', emoji: '🐻‍❄️', color: '#3b82f6', created_at: '' },
      { id: '2', name: 'E.S', emoji: '🐻', color: '#ec4899', created_at: '' },
    ];
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  if (!supabase || supabaseFailed) {
    const stored = localStorage.getItem('family_app_transactions');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      supabaseFailed = true;
      throw error;
    }
    return data ?? [];
  } catch {
    supabaseFailed = true;
    const stored = localStorage.getItem('family_app_transactions');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createTransaction(
  fromProfileId: string,
  toProfileId: string,
  amount: number
): Promise<void> {
  if (!supabase || supabaseFailed) {
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
    const { error } = await supabase.from('transactions').insert({
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      amount,
    });
    
    if (error) {
      supabaseFailed = true;
      throw error;
    }
  } catch {
    supabaseFailed = true;
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
