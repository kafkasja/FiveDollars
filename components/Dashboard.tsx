'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProfiles, getAllTransactions, createTransaction } from '@/lib/database';
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

  useEffect(() => {
    loadData();
  }, []);

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
        <div className="dashboard__greeting">Hello {currentProfile?.name}</div>
        <div className="dashboard__balance-label">
          {balance === 0 ? 'You are even' : balance > 0 ? `You owe $${balance * 5}` : `You are owed $${Math.abs(balance) * 5}`}
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

      <button className="dashboard__switch" onClick={() => router.push('/')}>
        Switch Profile
      </button>
    </div>
  );
}
