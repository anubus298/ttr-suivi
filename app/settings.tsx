import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  performBackupAndSave,
  performRestoreFromBackup,
} from "@/lib/api/backup.api";
import { ApplySettings, getSettings } from "@/lib/api/settings.api";
import { APP_VERSION } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";
import z from "zod";

const SettingsSchema = z.object({
  doctorName: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
  title: z.string().optional(),
});

const SettingsPage = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: { doctorName: "", title: "Médecin généraliste" },
  });

  // Query to get current settings
  const { data: currentSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: ApplySettings,
    mutationKey: ["updateSettings"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setIsPersonalInfoOpen(false);
    },
    onError: (err) => {
      console.error(err.message);
      Alert.alert(
        "Erreur",
        "Échec de la mise à jour des paramètres. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    },
  });

  // Load current settings into form when dialog opens
  useEffect(() => {
    if (isPersonalInfoOpen && currentSettings) {
      form.reset({
        doctorName: currentSettings.doctorName || "",
        title: currentSettings.title || "Médecin généraliste",
      });
    }
  }, [isPersonalInfoOpen, currentSettings, form]);

  const onSubmitPersonalInfo = (data: z.infer<typeof SettingsSchema>) => {
    updateSettingsMutation.mutate({
      doctorName: data.doctorName,
      titre: data.title,
    });
  };
  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const result = await performBackupAndSave();

      if (result.success) {
        Alert.alert(
          "Sauvegarde réussie",
          "Votre sauvegarde de base de données a été créée et partagée avec succès.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Échec de la sauvegarde", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert(
        "Erreur de sauvegarde",
        "Une erreur inattendue s'est produite lors de la création de la sauvegarde.",
        [{ text: "OK" }]
      );
      console.error("Backup error:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    // Show confirmation dialog first
    Alert.alert(
      "Restaurer la base de données",
      "⚠️ ATTENTION : Ceci supprimera TOUTES les données actuelles et les remplacera par les données de sauvegarde. Cette action ne peut pas être annulée.\n\nÊtes-vous sûr de vouloir continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, restaurer",
          style: "destructive",
          onPress: async () => {
            try {
              setIsRestoring(true);
              const result = await performRestoreFromBackup();

              if (result.success) {
                queryClient.invalidateQueries();
                Alert.alert("Restauration réussie", result.message, [
                  { text: "OK" },
                ]);
              } else {
                Alert.alert("Échec de la restauration", result.message, [
                  { text: "OK" },
                ]);
              }
            } catch (error) {
              Alert.alert(
                "Erreur de restauration",
                "Une erreur inattendue s'est produite lors de la restauration de la sauvegarde.",
                [{ text: "OK" }]
              );
              console.error("Restore error:", error);
            } finally {
              setIsRestoring(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-2 py-2 gap-6">
        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Mettez à jour votre nom et votre titre professionnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <Dialog
                open={isPersonalInfoOpen}
                onOpenChange={setIsPersonalInfoOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full">
                    <Text className="font-outfitRegular">
                      Modifier les informations personnelles
                    </Text>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Informations personnelles</DialogTitle>
                    <DialogDescription>
                      Mettez à jour votre nom et votre titre professionnel. Ces
                      informations peuvent être modifiées à tout moment.
                    </DialogDescription>
                    <Controller
                      name="doctorName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <View className="gap-y-1 flex">
                          <Text className="font-outfitLight">Nom :</Text>
                          <Input
                            value={field.value}
                            placeholder="Saisissez votre nom"
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
                        <View className="gap-y-1 flex">
                          <Text className="font-outfitLight">
                            Titre professionnel :
                          </Text>
                          <Input
                            value={field.value}
                            placeholder="Saisissez votre titre professionnel"
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
                    <Button
                      onPress={form.handleSubmit(onSubmitPersonalInfo)}
                      className="mt-4"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Text className="text-primary-foreground font-outfitSemibold">
                        {updateSettingsMutation.isPending
                          ? "Mise à jour..."
                          : "Confirmer"}
                      </Text>
                    </Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </View>
          </CardContent>
        </Card>

        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sauvegarde et restauration</CardTitle>
            <CardDescription>
              Créez des sauvegardes et restaurez votre base de données pour
              préserver vos dossiers patients et paramètres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <Button
                onPress={handleBackup}
                disabled={isBackingUp || isRestoring}
                className="w-full"
              >
                <Text className="text-primary-foreground font-outfitRegular">
                  {isBackingUp
                    ? "Création de la sauvegarde..."
                    : "Créer une sauvegarde"}
                </Text>
              </Button>
              {isBackingUp && (
                <Text
                  variant="small"
                  className="text-center text-xs font-outfitLight text-muted-foreground"
                >
                  Veuillez patienter pendant que nous optimisons votre base de
                  données et exportons vos données...
                </Text>
              )}
              <View>
                <Text className="font-outfitLight text-xs text-muted-foreground">
                  ❓Créez un fichier JSON contenant tous vos dossiers patients,
                  paramètres et données médicales. La base de données sera
                  optimisée avant l'exportation pour garantir des performances
                  optimales.
                </Text>
              </View>

              <View className="border-t border-border pt-4 mt-2">
                <Button
                  onPress={handleRestore}
                  disabled={isBackingUp || isRestoring}
                  variant="destructive"
                  className="w-full"
                >
                  <Text className="text-white font-outfitRegular">
                    {isRestoring
                      ? "Restauration..."
                      : "Restaurer depuis une sauvegarde"}
                  </Text>
                </Button>

                {isRestoring && (
                  <Text className="text-center font-outfitLight text-xs mt-3 text-muted-foreground">
                    Veuillez patienter pendant que nous restaurons vos
                    données...
                  </Text>
                )}
                <Text className="font-outfitLight text-xs text-muted-foreground mt-3">
                  ⚠️ La restauration remplacera TOUTES les données actuelles par
                  les données de sauvegarde. Cette action ne peut pas être
                  annulée.
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Placeholder for other settings sections */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'application</CardTitle>
            <CardDescription>
              Configurez les préférences et le comportement de l'application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="font-outfitLight text-xs text-muted-foreground">
              Des paramètres d'application supplémentaires seront disponibles
              ici dans les futures mises à jour.
            </Text>
            <View className="w-full  items-end justify-end flex">
              <Text className="font-outfitLight mt-2 text-xs text-muted-foreground">
                Version {APP_VERSION}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default SettingsPage;
