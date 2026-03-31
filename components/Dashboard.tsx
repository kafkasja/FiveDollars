'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProfiles, getAllTransactions, createTransaction, isSupabaseConnected, syncLocalStorageToSupabase } from '@/lib/database';
import type { Profile, Transaction } from '@/types';
import './Dashboard.css';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get('profileId');
   
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
    setConnected(isSupabaseConnected());
  }, []);

  useEffect(() => {
    if (connected) {
      // When we become connected, try to sync localStorage to Supabase
      syncLocalStorageToSupabase().catch(console.error);
    }
  }, [connected]);

  async function loadData() {
    try {
      const [profilesData, txData] = await Promise.all([
        getProfiles(),
        getAllTransactions(),
      ]);
      setProfiles(profilesData);
      setTransactions(txData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentProfile = profiles.find(p => p.id === profileId);
  const otherProfile = profiles.find(p => p.id !== profileId);

  async function handlePay(isReceiving: boolean) {
    if (!currentProfile || !otherProfile || saving) return;
    setSaving(true);
    try {
      if (isReceiving) {
        await createTransaction(otherProfile.id, currentProfile.id, 1);
      } else {
        await createTransaction(currentProfile.id, otherProfile.id, 1);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to create transaction:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleManualSync() {
    setSyncing(true);
    try {
      await syncLocalStorageToSupabase();
      // Refetch data to show synced transactions
      await loadData();
    } catch (err) {
      console.error('Failed to sync:', err);
    } finally {
      setSyncing(false);
    }
  }

  function getBalance(): number {
    if (!currentProfile || !otherProfile) return 0;
    let balance = 0;
    for (const tx of transactions) {
      if (tx.from_profile_id === currentProfile.id) balance += Number(tx.amount);
      if (tx.to_profile_id === currentProfile.id) balance -= Number(tx.amount);
    }
    return balance;
  }

  function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getTransactionLabel(tx: Transaction): string {
    const fromProfile = profiles.find(p => p.id === tx.from_profile_id);
    const toProfile = profiles.find(p => p.id === tx.to_profile_id);
    if (tx.from_profile_id === currentProfile?.id) {
      return `You owe ${toProfile?.name || ''} $5`;
    }
    return `${fromProfile?.name || ''} owes you $5`;
  }

  if (loading) {
    return <div className="dashboard"><div className="dashboard__loading">Loading...</div></div>;
  }

  const balance = getBalance();

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="dashboard__greeting">Merhaba {currentProfile?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '4px',
              backgroundColor: connected ? '#22c55e' : '#ef4444',
              color: 'white'
            }}>
              {connected ? '☁️ Cloud' : '📱 Local'}
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#6366f1',
                color: 'white',
                marginLeft: '8px'
              }}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
        <div className="dashboard__balance-label">
          {balance === 0 ? 'You are even' : balance > 0 ? `😭 You owe $${balance * 5}` : `🤑 You are owed $${Math.abs(balance) * 5}`}
        </div>
      </div>

      <div className="dashboard__other-user">
        <div className="dashboard__other-name">{otherProfile?.name}</div>
      </div>

      <div className="dashboard__actions">
        <button 
          className="dashboard__btn dashboard__btn--give"
          onClick={() => handlePay(false)}
          disabled={saving}
        >
          Give $5
        </button>
        <button 
          className="dashboard__btn dashboard__btn--receive"
          onClick={() => handlePay(true)}
          disabled={saving}
        >
          Receive $5
        </button>
      </div>

      <div className="dashboard__transactions">
        <h3 className="dashboard__tx-title">Recent</h3>
        {transactions.length === 0 ? (
          <div className="dashboard__tx-empty">No transactions yet</div>
        ) : (
          transactions.slice(0, 50).map(tx => (
            <div key={tx.id} className="dashboard__tx-item">
              <span className="dashboard__tx-label">{getTransactionLabel(tx)}</span>
              <span className="dashboard__tx-date">{formatDateTime(tx.created_at)}</span>
            </div>
          ))
        )}
      </div>

      <button className="dashboard__switch" onClick={() => alert('Rules:\n1. kalp kirmak\n2. kufur etmek\n3. öyglece para artirmak')}>
        See Rules
      </button>
    </div>
  );
}