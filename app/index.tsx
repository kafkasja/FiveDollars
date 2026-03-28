import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { saveSelectedProfile } from "@/lib/storage";
import type { Profile } from "@/types";

const { width } = Dimensions.get("window");
const CUBE_SIZE = (width - 80) / 2;

export default function ProfilePickerScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load profiles:", error);
    } else {
      setProfiles(data ?? []);
    }
    setLoading(false);
  }

  async function handleSelectProfile(profile: Profile) {
    await saveSelectedProfile(profile.id);
    router.replace({ pathname: "/(home)", params: { profileId: profile.id } });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f13", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f13", paddingHorizontal: 32, paddingTop: 80 }}>
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
        Who's here?
      </Text>
      <Text style={{ color: "#9ca3af", fontSize: 16, textAlign: "center", marginBottom: 48 }}>
        Tap your profile to get started
      </Text>

      <FlatList
        data={profiles}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 24 }}
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
  );
}

// ─── Profile Cube ─────────────────────────────────────────────────────────────

function ProfileCube({
  profile,
  size,
  onPress,
}: {
  profile: Profile;
  size: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: 20,
          backgroundColor: profile.color,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
          shadowColor: profile.color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.55,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        <Text style={{ fontSize: size * 0.36 }}>{profile.emoji}</Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 10, letterSpacing: 0.3 }}>
          {profile.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
