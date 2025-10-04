import { Text } from "@/components/ui/text";
import migrations from "@/drizzle/migrations";
import { checkIfAgreed } from "@/lib/api/settings.api";
import { db, runSeed } from "@/lib/db";
import { PortalHost } from "@rn-primitives/portal";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
const queryClient = new QueryClient();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
SplashScreen.preventAutoHideAsync();

export default function QueryWrapper() {
  return (
    <SafeAreaView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <RootLayout />
      </QueryClientProvider>
    </SafeAreaView>
  );
}

function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { data: isAgreed } = useQuery({
    queryKey: ["checkIfAgreed"],
    queryFn: checkIfAgreed,
    staleTime: 0,
  });
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
    SplashScreen.hideAsync();
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
      <Stack
        screenOptions={{
          animation: "fade",
        }}
      >
        <Stack.Protected guard={!!isAgreed}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="records"
            options={{
              headerShown: true,
              headerTitle: () => (
                <Text className="font-outfitSemibold text-xl">
                  Dossiers Patients
                </Text>
              ),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              headerTitle: () => (
                <Text className="font-outfitSemibold text-xl">Paramètres</Text>
              ),
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isAgreed}>
          <Stack.Screen name="welcoming" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" options={{}} />
      </Stack>
      <PortalHost />
      <StatusBar style="dark" />
    </>
  );
}
