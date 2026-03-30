import { View, Text, StyleSheet } from 'react-native';
import type { Transaction, Profile } from '../../types';
import { timeAgo, formatCurrency } from '../utils/helpers';
import { transactionsStyles } from './styles';
import { COLORS } from '../constants/theme';

interface RecentTransactionsProps {
  transactions: Transaction[];
  profiles: Profile[];
}

export function RecentTransactions({ transactions, profiles }: RecentTransactionsProps) {
  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  return (
    <View style={transactionsStyles.container}>
      <Text style={transactionsStyles.label}>Recent</Text>
      {transactions.map((tx) => {
        const from = getProfile(tx.from_profile_id);
        const to = getProfile(tx.to_profile_id);
        if (!from || !to) return null;
        
        return (
          <View key={tx.id} style={transactionsStyles.item}>
            <View style={transactionsStyles.itemLeft}>
              <Text style={transactionsStyles.emoji}>{from.emoji}</Text>
              <Text style={transactionsStyles.arrow}>→</Text>
              <Text style={transactionsStyles.emoji}>{to.emoji}</Text>
              <View style={transactionsStyles.itemDetails}>
                <Text style={transactionsStyles.itemNames}>
                  {from.name} → {to.name}
                </Text>
                <Text style={transactionsStyles.itemTime}>
                  {timeAgo(tx.created_at)}
                </Text>
              </View>
            </View>
            <Text style={transactionsStyles.itemAmount}>
              +{formatCurrency(Number(tx.amount))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
