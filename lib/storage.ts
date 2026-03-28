import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "family_app_selected_profile_id";

export async function saveSelectedProfile(profileId: string): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, profileId);
}

export async function getSelectedProfile(): Promise<string | null> {
  return AsyncStorage.getItem(PROFILE_KEY);
}

export async function clearSelectedProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
