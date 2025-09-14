import { Text, View } from "react-native";

import { useRouter } from "expo-router";
import { type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApplySettings } from "@/lib/api/settings.api";
import { primaryColor } from "@/lib/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartColumn, Thermometer, User, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const ROOT_STYLE: ViewStyle = { flex: 1 };

const SettingsSchema = z.object({
  doctorName: z
    .string()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { error: "Le nom ne peut pas dépasser 50 caractères" }),
  title: z.string().optional(),
});
export default function WelcomeConsentScreen() {
  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: { doctorName: "", title: "Médecin généraliste" },
  });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const applyFirstSettingsMutation = useMutation({
    mutationFn: ApplySettings,
    mutationKey: ["ApplyFirstSettings"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIfAgreed"] });
      queryClient.refetchQueries({ queryKey: ["checkIfAgreed"] });
      setIsOpen(false);
      setTimeout(() => {
        router.replace("/explore");
      }, 3000);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });
  const onSubmit = (data: z.infer<typeof SettingsSchema>) => {
    console.log(data);
    applyFirstSettingsMutation.mutate({
      doctorName: data.doctorName,
      titre: data.title,
    });
  };
  useEffect(() => {
    form.reset();
  }, [isOpen]);
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant={"default"}>
                <Text className="text-primary-foreground font-outfitSemibold">
                  Continuer
                </Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Informations personnelles</DialogTitle>
                <DialogDescription>
                  Entrez votre nom et Titre professionnel vous pourrez le
                  modifier plus tard
                </DialogDescription>
                <Controller
                  name="doctorName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <View className="gap-y-1 flex ">
                      <Text className=" font-outfitLight ">Nom:</Text>
                      <Input
                        value={field.value}
                        placeholder="Entrez votre nom"
                        onChangeText={field.onChange}
                      />
                      {fieldState.error?.message && (
                        <Text className="text-destructive font-outfitRegular text-sm">
                          {fieldState.error?.message ?? ""}
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <View className="gap-y-1 flex ">
                      <Text className=" font-outfitLight ">
                        Titre professionnel:
                      </Text>
                      <Input
                        value={field.value}
                        placeholder="Entrez votre titre professionnel"
                        onChangeText={field.onChange}
                      />
                      {fieldState.error?.message && (
                        <Text className="text-destructive font-outfitRegular text-sm">
                          {fieldState.error?.message ?? ""}
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Button onPress={form.handleSubmit(onSubmit)} className="mt-4">
                  <Text className="text-primary-foreground font-outfitSemibold">
                    Confirmer
                  </Text>
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
