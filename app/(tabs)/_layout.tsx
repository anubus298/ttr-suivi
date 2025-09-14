import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import { primaryColor } from "@/lib/theme";
import { Cross, House, User } from "lucide-react-native";
import { Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: "#000000",
        tabBarButton: HapticTab,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
        },
        tabBarBackground: () => <View className="bg-background flex-1"></View>,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House size={28} color={color} />,
          tabBarLabel: ({ focused }) => (
            <Text
              className={`text-sm font-outfitBold ${focused ? "text-primary" : "text-muted-foreground"}`}
            >
              Accueil
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Patients",
          tabBarIcon: ({ color }) => <User size={28} color={color} />,
          tabBarLabel: ({ focused }) => (
            <Text
              className={`text-sm font-outfitBold ${focused ? "text-primary" : "text-muted-foreground"}`}
            >
              Patients
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="maladies"
        options={{
          title: "Maladies",
          tabBarIcon: ({ color }) => <Cross size={28} color={color} />,
          tabBarLabel: ({ focused }) => (
            <Text
              className={`text-sm font-outfitBold ${focused ? "text-primary" : "text-muted-foreground"}`}
            >
              Maladies
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
