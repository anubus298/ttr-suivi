import { Text, View } from "react-native";

import { useRouter } from "expo-router";
import { type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ApplySettings } from "@/lib/api/settings.api";
import { primaryColor } from "@/lib/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartColumn, Thermometer, User, Users } from "lucide-react-native";

const ROOT_STYLE: ViewStyle = { flex: 1 };
export default function WelcomeConsentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const applyFirstSettingsMutation = useMutation({
    mutationFn: ApplySettings,
    mutationKey: ["ApplyFirstSettings"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIfAgreed"] });
      queryClient.refetchQueries({ queryKey: ["checkIfAgreed"] });
      setTimeout(() => {
        router.replace("/explore");
      }, 1000);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });

  const handleContinue = () => {
    // Create default settings to mark as agreed
    applyFirstSettingsMutation.mutate({
      doctorName: "Doctor", // Default name, can be changed in settings
      titre: "Médecin généraliste",
    });
  };
  return (
    <SafeAreaView style={ROOT_STYLE}>
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4 ">
        <View className="ios:pt-8 pt-12">
          <Text className="ios:text-left text-5xl ios:font-black text-center font-outfitBold">
            Bienvenue à
          </Text>
          <Text className="ios:text-left text-5xl ios:font-black text-primary text-center font-outfitBold">
            Suivi de TTR
          </Text>
        </View>
        <View className="gap-8">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row gap-4">
              <View className="pt-px">{feature.icon}</View>
              <View className="flex-1">
                <Text className="font-outfitSemibold text-lg">
                  {feature.title}
                </Text>
                <Text className="text-sm font-outfitRegular">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Users size={24} className="text-primary" color={primaryColor} />

            <Text className="pt-1 text-xs text-center font-outfitLight">
              En appuyant sur continuer, vous acceptez nos{" "}
              <Text className="text-xs text-primary">
                Conditions d’utilisation{" "}
              </Text>
              et reconnaissez avoir lu notre{" "}
              <Text className="text-xs text-primary">
                Politique de confidentialité
              </Text>
            </Text>
          </View>

          <Button
            variant="default"
            onPress={handleContinue}
            disabled={applyFirstSettingsMutation.isPending}
          >
            <Text className="text-primary-foreground font-outfitSemibold">
              {applyFirstSettingsMutation.isPending
                ? "Chargement..."
                : "Continuer"}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const FEATURES = [
  {
    title: "Dossiers Patients",
    description:
      "Ajoutez, consultez et gérez facilement les informations et l’historique médical des patients.",
    icon: <User size={24} color={primaryColor} />,
  },
  {
    title: "Suivi des Maladies",
    description:
      "Surveillez et enregistrez l’évolution des maladies pour de meilleurs aperçus de traitement.",
    icon: <Thermometer size={24} color={primaryColor} />,
  },
  {
    title: "Visualisation des Données",
    description:
      "Visualisez les données et tendances des patients avec des graphiques et tableaux interactifs.",
    icon: <ChartColumn size={24} color={primaryColor} />,
  },
] as const;
