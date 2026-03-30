'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProfiles, getTransactions, getAllTransactions, createTransaction, calculateBalance } from '@/lib/database';
import type { Profile, Balance, Transaction } from '@/types';

const STEP = 5;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get('profileId');

  const [me, setMe] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadData = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true);
    try {
      const [profilesData, txsData, allTxs] = await Promise.all([
        getProfiles(),
        getTransactions(5),
        getAllTransactions(),
      ]);
      
      setProfiles(profilesData);
      setMe(profilesData.find((p) => p.id === profileId) ?? null);
      setRecentTxs(txsData);
      setBalance(calculateBalance(profilesData, allTxs));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addPayment(fromProfileId: string, toProfileId: string) {
    setPosting(true);
    try {
      await createTransaction(fromProfileId, toProfileId, STEP);
      await loadData();
    } catch (error) {
      alert('Could not save. Try again.');
      console.error(error);
    } finally {
      setPosting(false);
    }
  }

  function handleSwitchProfile() {
    if (confirm('Go back to the profile picker?')) {
      localStorage.removeItem('family_app_selected_profile_id');
      router.push('/');
    }
  }

  if (loading || !me) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const others = profiles.filter((p) => p.id !== me.id);
  const settled = !balance || balance.amount === 0;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: me.color }}
            >
              {me.emoji}
            </div>
            <div>
              <p className="text-gray-500 text-xs">Logged in as</p>
              <p className="text-white text-xl font-bold">{me.name}</p>
            </div>
          </div>
          <button onClick={handleSwitchProfile} className="text-gray-500 text-sm px-2 py-1">
            Switch
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-6 rounded-3xl p-6 bg-surface border border-white/10">
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-4">Current balance</p>
        
        {settled ? (
          <div className="items-center py-3">
            <p className="text-4xl">✅</p>
            <p className="text-white text-xl font-bold mt-2">All settled!</p>
            <p className="text-gray-500 text-sm mt-1">No one owes anyone anything</p>
          </div>
        ) : (
          <div className="items-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-2xl">{balance!.debtor.emoji}</span>
              <span className="text-white font-semibold">{balance!.debtor.name}</span>
              <span className="text-gray-500">owes</span>
              <span className="text-white font-semibold">{balance!.creditor.name}</span>
              <span className="text-2xl">{balance!.creditor.emoji}</span>
            </div>
            <p className="text-6xl font-extrabold text-primary mt-2 text-center">
              ${balance!.amount}
            </p>
          </div>
        )}
      </div>

      {/* Payment Buttons */}
      <div className="px-6 mt-8">
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-4">Add ${STEP}</p>
        
        {others.map((other) => (
          <div key={other.id} className="mb-3">
            <div className="flex gap-3">
              <button
                disabled={posting}
                onClick={() => addPayment(me.id, other.id)}
                className="flex-1 rounded-2xl py-4 bg-surface border border-white/10 disabled:opacity-50"
              >
                <p className="text-white font-semibold">I owe {other.name} ${STEP}</p>
                <p className="text-gray-500 text-xs mt-1">{me.emoji} → {other.emoji}</p>
              </button>

              <button
                disabled={posting}
                onClick={() => addPayment(other.id, me.id)}
                className="flex-1 rounded-2xl py-4 bg-surface border border-white/10 disabled:opacity-50"
              >
                <p className="text-white font-semibold">{other.name} owes me ${STEP}</p>
                <p className="text-gray-500 text-xs mt-1">{other.emoji} → {me.emoji}</p>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      {recentTxs.length > 0 && (
        <div className="px-6 mt-8">
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-4">Recent</p>
          
          {recentTxs.map((tx) => {
            const from = profiles.find(p => p.id === tx.from_profile_id);
            const to = profiles.find(p => p.id === tx.to_profile_id);
            if (!from || !to) return null;
            
            return (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{from.emoji}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-xl">{to.emoji}</span>
                  <div>
                    <p className="text-gray-300 text-sm">{from.name} → {to.name}</p>
                    <p className="text-gray-500 text-xs">{timeAgo(tx.created_at)}</p>
                  </div>
                </div>
                <p className="text-primary font-bold">+${Number(tx.amount)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
