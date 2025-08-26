import "../global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import migrations from "@/drizzle/migrations";
import { View } from "react-native";
import { db, runSeed } from "@/lib/db";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
const queryClient = new QueryClient();
export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [loaded] = useFonts({
    outfitLight: require("../assets/fonts/300.ttf"),
    outfitRegular: require("../assets/fonts/400.ttf"),
    outfitSemibold: require("../assets/fonts/600.ttf"),
    outfitBold: require("../assets/fonts/700.ttf"),
  });

  useEffect(() => {
    if (!success) {
      console.log(error?.message, error?.stack);
      return;
    }
    runSeed();
  }, [success]);
  if (!loaded) {
    return null;
  }
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="inverted" />
        <PortalHost />
      </QueryClientProvider>
    </>
  );
}
