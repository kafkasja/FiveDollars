import { View, Text, StyleSheet } from 'react-native';
import type { Balance } from '../../types';
import { balanceCardStyles } from './styles';

interface BalanceCardProps {
  balance: Balance | null;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const settled = !balance || balance.amount === 0;

  return (
    <View style={balanceCardStyles.container}>
      <Text style={balanceCardStyles.label}>Current balance</Text>

      {settled ? (
        <View style={balanceCardStyles.settledContainer}>
          <Text style={balanceCardStyles.settledEmoji}>✅</Text>
          <Text style={balanceCardStyles.settledTitle}>All settled!</Text>
          <Text style={balanceCardStyles.settledSubtitle}>No one owes anyone anything</Text>
        </View>
      ) : (
        <View style={balanceCardStyles.balanceContainer}>
          <View style={balanceCardStyles.balanceRow}>
            <Text style={balanceCardStyles.profileEmoji}>{balance!.debtor.emoji}</Text>
            <Text style={balanceCardStyles.profileName}>{balance!.debtor.name}</Text>
            <Text style={balanceCardStyles.owesText}>owes</Text>
            <Text style={balanceCardStyles.profileName}>{balance!.creditor.name}</Text>
            <Text style={balanceCardStyles.profileEmoji}>{balance!.creditor.emoji}</Text>
          </View>
          <Text style={balanceCardStyles.amount}>${balance!.amount}</Text>
        </View>
      )}
    </View>
  );
}
