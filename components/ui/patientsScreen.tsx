import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patientsTable } from "@/db/schema";
import { getAllMaladies } from "@/lib/api/maladies.api";
import {
  addPatient,
  deletePatient,
  getAllPatients,
  updatePatient,
} from "@/lib/api/patients.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Building2,
  Filter,
  Plus,
  Search,
  Thermometer,
  Trash,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Text } from "./text";
const PatientSchema = z.object({
  full_name: z.string().min(2),
  hospital_id: z.string().nullable(),
  maladieId: z.number(),
});
const ActionPatientButton = ({
  patient,
  isUpdate = false,
  open,
  setOpen,
}: {
  patient?: typeof patientsTable.$inferSelect;
  isUpdate?: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof PatientSchema>>({
    resolver: zodResolver(PatientSchema),
    defaultValues: isUpdate
      ? patient
      : {
          full_name: "",
          hospital_id: "",
          maladieId: 0,
        },
  });
  const onSubmit = (data: z.infer<typeof PatientSchema>) => {
    console.log(data);
    if (isUpdate && patient?.id) {
      updatePatientMutation.mutate({ patient: data, patientId: patient.id });
    }
    if (!isUpdate) {
      addPatientMutation.mutate({ patient: data });
    }
  };
  const queryClient = useQueryClient();
  const updatePatientMutation = useMutation({
    mutationKey: ["updatePatient"],
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("addPatient failed,", err);
    },
  });
  const addPatientMutation = useMutation({
    mutationKey: ["addPatient"],
    mutationFn: addPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("addPatient failed,", err);
    },
  });
  useEffect(() => {
    if (isUpdate) {
      form.reset(patient);
    } else {
      form.reset({
        full_name: "",
        hospital_id: undefined,
        maladieId: undefined,
      });
    }
  }, [open]);

  const { data: maladies } = useQuery({
    queryKey: ["all-maladies"],
    queryFn: getAllMaladies,
  });
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Modifier un patient" : "Créer un patient"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Mettez à jour les informations du patient ici. Cliquez sur enregistrer lorsque vous avez terminé."
              : "Remplissez les informations du patient ici. Cliquez sur enregistrer lorsque vous avez terminé."}
          </DialogDescription>
          <View className="space-y-4 flex">
            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">
                    Nom complete:
                  </Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                </View>
              )}
              name="full_name"
            />

            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">
                    ID Hopital:
                  </Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                  />
                </View>
              )}
              name="hospital_id"
            />

            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">
                    Maladie:
                  </Text>
                  <Select
                    value={{
                      label:
                        maladies?.find((m) => m.id === field.value)?.name ??
                        "Choisir le maladie",
                      value: field?.value?.toString?.() ?? "",
                    }}
                    onValueChange={(o) =>
                      field.onChange(parseInt(o?.value ?? ""))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent
                      insets={contentInsets}
                      className="z-50 w-[180px]"
                    >
                      <NativeSelectScrollView>
                        {maladies?.map((ml) => (
                          <SelectItem
                            className="font-outfitSemibold"
                            key={ml.id + "maladie-select-item"}
                            label={ml.name}
                            value={ml.id.toString()}
                          >
                            {ml.name}
                          </SelectItem>
                        ))}
                      </NativeSelectScrollView>
                    </SelectContent>
                  </Select>
                </View>
              )}
              name="maladieId"
            />
          </View>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={!form.formState.isValid}
            onPress={form.handleSubmit(onSubmit)}
          >
            <Text>Enregistrer</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeletePatientButton = ({
  patient,
}: {
  patient: typeof patientsTable.$inferSelect;
}) => {
  const onSubmit = () => {
    addPatientMutation.mutate({ patientId: patient.id });
  };
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const addPatientMutation = useMutation({
    mutationKey: ["deletePatient"],
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] });
      setOpen(false);
    },
    onError: (err) => {
      console.error("DeletePatient failed.", err);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          activeOpacity={0.8}
        >
          <Trash size={16} color={"red"} />
        </TouchableOpacity>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            Supprimer le patient
          </DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer le patient {patient.full_name} ?
            Êtes-vous sûr(e) ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onPress={onSubmit} variant={"destructive"}>
            <Text>Supprimer</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const PatientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openData, setOpenData] = useState<{
    open: boolean;
    isUpdate: boolean;
    patient?: typeof patientsTable.$inferSelect;
  }>({ open: false, isUpdate: false, patient: undefined });
  const { data: patients } = useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
  });

  const filteredPatients =
    searchQuery.length <= 1
      ? patients
      : patients?.filter(
          (patient) =>
            patient.full_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            patient.maladieId.toString().includes(searchQuery.toLowerCase()) ||
            patient.hospital_id
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );

  return (
    <>
      <View className="flex-1 bg-slate-50">
        {/* Header */}

        <ActionPatientButton
          {...openData}
          setOpen={(v) => setOpenData((prev) => ({ ...prev, open: v }))}
        />
        <View className="bg-white px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-outfitBold text-gray-900">
                Patients
              </Text>
              <Text className="text-sm text-gray-500 font-outfitRegular">
                {filteredPatients?.length ?? 0} patients trouvés
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setOpenData({
                  open: true,
                  isUpdate: false,
                  patient: undefined,
                })
              }
              className="w-12 h-12 bg-primary rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center gap-x-1">
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex-row items-center">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="font-outfitRegular flex-1 ml-3 text-base text-gray-900"
                placeholder="Rechercher un patient..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              className="w-12 h-12 rounded-2xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Patients List */}
        <ScrollView
          className="space-y-4 px-2"
          bounces={false}
          showsHorizontalScrollIndicator={false}
        >
          {filteredPatients?.map((p) => (
            <PatientCard
              setOpenData={setOpenData}
              key={p.id + "-" + p.hospital_id + "patient-card"}
              patient={p}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const PatientCard = ({
  patient,
  setOpenData,
}: {
  patient: typeof patientsTable.$inferSelect;
  setOpenData: (v: {
    patient?: typeof patientsTable.$inferSelect;
    open: boolean;
    isUpdate: boolean;
  }) => void;
}) => {
  const [detailsIsOpen, setDetailsIsOpen] = useState(false);
  const router = useRouter();
  return (
    <View
      className="bg-white rounded-3xl p-6 mb-4 shadow-lg border border-gray-50"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Patient Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mr-4">
          <User size={28} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-outfitBold text-gray-900 mb-1">
              {patient.full_name}
            </Text>

            <DeletePatientButton patient={patient} />
          </View>
          <View className="flex-row justify-between items-center">
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-outfitSemibold text-gray-600">
                ID: {patient.id}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Patient Details */}
      <View className="gap-y-1 flex">
        {/* Hospital */}
        <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-2xl">
          <View className="w-8 h-8 bg-blue-200 rounded-full items-center justify-center mr-3">
            <Building2 size={16} color="#2563EB" />
          </View>
          <View>
            <Text className="text-xs font-outfitSemibold text-primary uppercase tracking-wide">
              Hôpital ID
            </Text>
            <Text className="text-base font-outfitSemibold text-primary/90">
              {patient.hospital_id}
            </Text>
          </View>
        </View>

        {/* Disease */}
        <View className="flex-row  items-center bg-red-50 px-4 py-3 rounded-2xl">
          <View className="w-8 h-8 bg-red-200 rounded-full items-center justify-center mr-3">
            <Thermometer size={16} />
          </View>
          <View>
            <Text className="text-xs  font-outfitSemibold text-red-600 uppercase tracking-wide">
              Diagnostic
            </Text>
            <Text className="text-base font-outfitSemibold text-red-900">
              {/* @ts-expect-error */}
              {patient.maladieName}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Indicator */}
      <View className="mt-4 pt-4 border-t border-gray-100">
        <Dialog open={detailsIsOpen} onOpenChange={setDetailsIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Text className="font-outfitSemibold">
                Touchez pour voir plus de détails
              </Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Details</DialogTitle>
            </DialogHeader>
            <View className="flex-row w-full gap-x-1 mt-3 flex">
              <Button
                onPress={() => {
                  router.push(
                    //@ts-expect-error
                    "/records?maladieId=" +
                      patient.maladieId +
                      "&" +
                      "userId=" +
                      patient.id
                  );
                  setDetailsIsOpen(false);
                }}
              >
                <Text className="text-background font-outfitSemibold">
                  Voir le graphe
                </Text>
              </Button>

              <Button
                onPress={() => {
                  setDetailsIsOpen(false);
                  setOpenData({
                    open: true,
                    isUpdate: true,
                    patient,
                  });
                }}
                className=""
              >
                <Text className="text-background font-outfitSemibold">
                  Modifier
                </Text>
              </Button>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </View>
  );
};
export default PatientsScreen;
