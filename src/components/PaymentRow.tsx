import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Profile } from '../../types';
import { PAYMENT_STEP } from '../constants/theme';
import { paymentSectionStyles } from './styles';

interface PaymentRowProps {
  me: Profile;
  other: Profile;
  disabled: boolean;
  onPress: (fromId: string, toId: string) => void;
}

export function PaymentRow({ me, other, disabled, onPress }: PaymentRowProps) {
  return (
    <View style={paymentSectionStyles.row}>
      <View style={paymentSectionStyles.buttonRow}>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPress(me.id, other.id)}
          style={[
            paymentSectionStyles.button,
            disabled && paymentSectionStyles.buttonDisabled,
          ]}
        >
          <Text style={paymentSectionStyles.buttonText}>
            I owe {other.name} ${PAYMENT_STEP}
          </Text>
          <Text style={paymentSectionStyles.buttonSubtext}>
            {me.emoji} → {other.emoji}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPress(other.id, me.id)}
          style={[
            paymentSectionStyles.button,
            disabled && paymentSectionStyles.buttonDisabled,
          ]}
        >
          <Text style={paymentSectionStyles.buttonText}>
            {other.name} owes me ${PAYMENT_STEP}
          </Text>
          <Text style={paymentSectionStyles.buttonSubtext}>
            {other.emoji} → {me.emoji}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
