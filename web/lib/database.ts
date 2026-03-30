import { supabase } from './supabase';
import type { Profile, Transaction, Balance } from '@/types';

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data ?? [];
}

export async function getTransactions(limit = 5): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data ?? [];
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');
  
  if (error) throw error;
  return data ?? [];
}

export async function createTransaction(
  fromProfileId: string,
  toProfileId: string,
  amount: number
): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    from_profile_id: fromProfileId,
    to_profile_id: toProfileId,
    amount,
  });
  
  if (error) throw error;
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
