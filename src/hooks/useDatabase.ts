import { useState, useEffect, useCallback } from 'react';
import type { Profile, Transaction, Balance } from '../../types';
import * as db from '../services/database';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadProfiles = useCallback(async () => {
    try {
      const data = await db.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => { loadProfiles(); }, [loadProfiles]);
  
  return { profiles, loading, reload: loadProfiles };
}

export function useBalance(profiles: Profile[]) {
  const [balance, setBalance] = useState<Balance | null>(null);
  
  const loadBalance = useCallback(async () => {
    if (profiles.length < 2) {
      setBalance(null);
      return;
    }
    
    try {
      const transactions = await db.getAllTransactions();
      const calculatedBalance = db.calculateBalance(profiles, transactions);
      setBalance(calculatedBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  }, [profiles]);
  
  useEffect(() => { loadBalance(); }, [loadBalance]);
  
  return { balance, reload: loadBalance };
}

export function useRecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const loadTransactions = useCallback(async () => {
    try {
      const data = await db.getTransactions(5);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);
  
  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  
  return { transactions, reload: loadTransactions };
}

export function useRealtime(callback: () => void) {
  useEffect(() => {
    const channel = db.subscribeToTransactions(callback);
    return () => { channel.unsubscribe(); };
  }, [callback]);
}
