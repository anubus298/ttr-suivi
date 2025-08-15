import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import "./global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import migrations from "@/drizzle/migrations";
import { Text, View } from "react-native";
import { db } from "@/lib/db";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NAV_THEME } from "@/lib/constants";
import { patientsTable } from "@/db/schema";
const queryClient = new QueryClient();
export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (!success) {
      console.log(error?.message, error?.stack);
      return;
    }
    (async () => {
      await db.delete(patientsTable);

      await db.insert(patientsTable).values([
        {
          full_name: "samira samira",
          id: 45,
          maladieId: 54,
          hospital_id: "546",
          created_at: new Date().toISOString(),
        },
      ]);
    })();
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
  const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
  };
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={LIGHT_THEME}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>

      <PortalHost />
    </>
  );
}
