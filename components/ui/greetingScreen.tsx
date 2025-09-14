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
import { getAllPatients } from "@/lib/api/patients.api";
import { ApplySettings, getSettings } from "@/lib/api/settings.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  FileUser,
  Settings,
  Thermometer,
  User,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import z from "zod";
import { Text } from "./text";

const getCurrentGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const SettingsSchema = z.object({
  doctorName: z
    .string()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { error: "Le nom ne peut pas dépasser 50 caractères" }),
  title: z.string().optional(),
});
const DoctorGreetingScreen = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: patientsData } = useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
  });
  const { data: settings } = useQuery({
    queryKey: ["checkIfAgreed", "homepage"],
    queryFn: getSettings,
  });
  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: { doctorName: settings?.doctorName, title: settings?.title },
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const applyFirstSettingsMutation = useMutation({
    mutationFn: ApplySettings,
    mutationKey: ["ApplyFirstSettings"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIfAgreed"] });
      queryClient.refetchQueries({ queryKey: ["checkIfAgreed"] });
      setIsOpen(false);
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
  useEffect(() => {
    form.reset({ doctorName: settings?.doctorName, title: settings?.title });
  }, [settings]);
  return (
    <>
      <Dialog open={isOpen} className="flex-1" onOpenChange={setIsOpen}>
        <ScrollView className="flex-1 bg-slate-50">
          {/* Header */}
          <View className="flex-row w-full justify-between items-center pt-14 pb-6 px-6 bg-white">
            <View className="  flex-row items-center">
              <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center">
                <User size={28} color="#3B82F6" />
              </View>
              <View className="ml-4 ">
                <Text className="font-outfitBold text-gray-900">
                  Dr. {settings?.doctorName}
                </Text>
                <Text className="text-sm text-gray-600 font-outfitLight">
                  {settings?.title}
                </Text>
              </View>
            </View>
            <View>
              <DialogTrigger asChild>
                <Button variant={"ghost"}>
                  <Text className="text-primary-foreground font-outfitSemibold">
                    <Settings size={24} />
                  </Text>
                </Button>
              </DialogTrigger>
            </View>
          </View>

          {/* Greeting Section */}
          <View className="px-6 py-8 bg-white mb-4">
            <Text className="text-3xl font-outfitBold text-gray-900 mb-2">
              {getCurrentGreeting()}, Docteur !👋
            </Text>
            <Text className="text-base font-outfitLight text-muted-foreground  mb-1 capitalize">
              {getCurrentDate()}
            </Text>
            <Text className="text-sm text-muted-foreground font-outfitLight">
              Prêt pour une nouvelle journée de soins ?
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="px-6 mb-6">
            <View className="flex-row flex gap-x-2">
              <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-outfitSemibold text-gray-600">
                    Vous avez
                  </Text>
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                    <FileUser size={20} color="#10B981" />
                  </View>
                </View>
                <Text className="text-3xl font-outfitBold text-gray-900 mb-1">
                  {patientsData?.length}
                </Text>
                <Text className="text-xs text-muted-foreground font-outfitRegular">
                  Patients
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6">
            <Text className="text-xl font-outfitBold text-gray-900 mb-5">
              Actions rapides
            </Text>

            <View className="gap-y-3">
              <TouchableOpacity
                onPress={() => router.navigate("/explore")}
                className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 bg-indigo-100 rounded-2xl items-center justify-center mr-4">
                  <Users size={28} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-outfitSemibold text-gray-900 mb-1">
                    Liste des patients
                  </Text>
                  <Text className="text-sm text-muted-foreground font-outfitRegular">
                    Consulter tous les dossiers patients
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.navigate("/maladies")}
                className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 bg-red-100 rounded-2xl items-center justify-center mr-4">
                  <Thermometer size={28} color="#f56565" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-outfitSemibold text-gray-900 mb-1">
                    Liste des maladies
                  </Text>
                  <Text className="text-sm text-muted-foreground font-outfitRegular">
                    Consulter tous les maladies
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom spacing for scroll */}
          <View className="h-8" />
        </ScrollView>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Informations personnelles</DialogTitle>
            <DialogDescription>
              Entrez votre nom et Titre professionnel vous pourrez le modifier
              plus tard
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
    </>
  );
};

export default DoctorGreetingScreen;
