import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { View } from "react-native";
import { getSelectedProfile } from "@/lib/storage";
import "../global.css"; // NativeWind — note the ../ because this file is inside /app

export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const profileId = await getSelectedProfile();
      if (profileId) {
        router.replace({ pathname: "/(home)", params: { profileId } });
      }
      setChecked(true);
    })();
  }, []);

  if (!checked) {
    return <View style={{ flex: 1, backgroundColor: "#0f0f13" }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
