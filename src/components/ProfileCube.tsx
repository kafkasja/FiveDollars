import { useRef } from 'react';
import { TouchableOpacity, Animated, Text, StyleSheet, ViewStyle } from 'react-native';
import type { Profile } from '../../types';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

interface ProfileCubeProps {
  profile: Profile;
  size: number;
  onPress: () => void;
}

export function ProfileCube({ profile, size, onPress }: ProfileCubeProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const animatedStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: profile.color,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale }],
    shadowColor: profile.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <Text style={styles.emoji}>{profile.emoji}</Text>
        <Text style={styles.name}>{profile.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 36,
    color: COLORS.text,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 0.3,
  },
});
