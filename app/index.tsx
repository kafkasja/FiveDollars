import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ProfileCube } from '../src/components';
import { saveSelectedProfile, getSelectedProfile } from '@/lib/storage';
import { getProfiles } from '../src/services/database';
import { sharedStyles } from '../src/components/styles';
import type { Profile } from '@/types';

const { width } = Dimensions.get('window');
const CUBE_SIZE = (width - 80) / 2;

export default function ProfilePickerScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  async function checkExistingProfile() {
    const profileId = await getSelectedProfile();
    if (profileId) {
      router.replace({ pathname: '/(home)', params: { profileId } });
    } else {
      setCheckingProfile(false);
      loadProfiles();
    }
  }

  async function loadProfiles() {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectProfile(profile: Profile) {
    await saveSelectedProfile(profile.id);
    router.replace({ pathname: '/(home)', params: { profileId: profile.id } });
  }

  if (loading || checkingProfile) {
    return (
      <View style={sharedStyles.centerContent}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={sharedStyles.container}>
      <View style={{ paddingHorizontal: 32, paddingTop: 80 }}>
        <Text style={titleStyles.text}>Who's here?</Text>
        <Text style={titleStyles.subtext}>Tap your profile to get started</Text>

        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 24 }}
          scrollEnabled={false}
          renderItem={({ item: profile }) => (
            <ProfileCube
              profile={profile}
              size={CUBE_SIZE}
              onPress={() => handleSelectProfile(profile)}
            />
          )}
        />
      </View>
    </View>
  );
}

const titleStyles = {
  text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtext: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 48,
  },
};
