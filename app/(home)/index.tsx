import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BalanceCard, PaymentRow, RecentTransactions } from '../../src/components';
import { headerStyles, paymentSectionStyles, sharedStyles } from '../../src/components/styles';
import { clearSelectedProfile } from '@/lib/storage';
import { createTransaction, getProfiles, getAllTransactions, getTransactions, calculateBalance, subscribeToTransactions } from '../../src/services/database';
import type { Profile, Balance, Transaction } from '@/types';

export default function DashboardScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const [me, setMe] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadData = useCallback(async () => {
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

    const channel = subscribeToTransactions(() => {
      loadData();
    });

    return () => { channel.unsubscribe(); };
  }, [loadData]);

  async function addPayment(fromProfileId: string, toProfileId: string) {
    setPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createTransaction(fromProfileId, toProfileId, 5);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Could not save. Try again.');
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPosting(false);
    }
  }

  async function handleSwitchProfile() {
    Alert.alert('Switch Profile', 'Go back to the profile picker?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch',
        style: 'destructive',
        onPress: async () => {
          await clearSelectedProfile();
          router.replace('/');
        },
      },
    ]);
  }

  if (loading || !me) {
    return (
      <View style={sharedStyles.centerContent}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const others = profiles.filter((p) => p.id !== me.id);

  return (
    <ScrollView style={sharedStyles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={headerStyles.container}>
        <View style={headerStyles.row}>
          <View style={headerStyles.profileInfo}>
            <View style={[headerStyles.avatar, { backgroundColor: me.color }]}>
              <Text style={{ fontSize: 26 }}>{me.emoji}</Text>
            </View>
            <View>
              <Text style={headerStyles.label}>Logged in as</Text>
              <Text style={headerStyles.name}>{me.name}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSwitchProfile} style={headerStyles.switchButton}>
            <Text style={headerStyles.switchText}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BalanceCard balance={balance} />

      <View style={paymentSectionStyles.container}>
        <Text style={paymentSectionStyles.label}>Add $5</Text>
        {others.map((other) => (
          <PaymentRow
            key={other.id}
            me={me}
            other={other}
            disabled={posting}
            onPress={addPayment}
          />
        ))}
      </View>

      {recentTxs.length > 0 && (
        <RecentTransactions transactions={recentTxs} profiles={profiles} />
      )}
    </ScrollView>
  );
}
