import { RecordsScreen } from "@/components/ui/recordsScreen";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Records() {
  const { userId, maladieId } = useLocalSearchParams();
  return (
    <View className="flex-1 bg-white">
      <RecordsScreen
        userId={parseInt(userId as string)}
        maladieId={parseInt(maladieId as string)}
      />
    </View>
  );
}
