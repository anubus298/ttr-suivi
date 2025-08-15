import { View } from "react-native";

import DoctorGreetingScreen from "@/components/ui/greetingScreen";
export default function HomeScreen() {
  return (
    <View className="bg-white flex-1">
      <DoctorGreetingScreen />
    </View>
  );
}
