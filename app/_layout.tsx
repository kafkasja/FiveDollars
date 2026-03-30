import { Stack } from "expo-router";
import "../global.css"; // NativeWind — note the ../ because this file is inside /app

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
