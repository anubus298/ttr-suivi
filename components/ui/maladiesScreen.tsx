import { maladiesTable } from "@/db/schema";
import {
  addMaladie,
  deleteMaladie,
  getAllMaladies,
  updateMaladie,
} from "@/lib/api/maladies.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  Filter,
  Pen,
  Plus,
  Search,
  Thermometer,
  Trash,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
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
const MaladieSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    minA: z.string({ message: "minA doit être un nombre" }),
    maxB: z.string({ message: "maxB doit être un nombre" }),
    unit: z.string().min(1, { message: "L'unité est obligatoire" }),
  })
  .refine((data) => parseFloat(data.maxB) > parseFloat(data.minA), {
    message: "maxB doit être supérieur à minA",
    path: ["maxB"],
  });
const ActionMaladieButton = ({
  maladie,
  isUpdate = false,
  open,
  setOpen,
}: {
  maladie?: typeof maladiesTable.$inferSelect;
  isUpdate?: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof MaladieSchema>>({
    resolver: zodResolver(MaladieSchema),
    defaultValues: isUpdate
      ? {
          ...maladie,
          minA: maladie?.minA?.toString?.() ?? "",
          maxB: maladie?.maxB?.toString?.() ?? "",
        }
      : {
          name: "",
          unit: "",
          maxB: "",
          minA: "",
        },
  });
  const onSubmit = (data: z.infer<typeof MaladieSchema>) => {
    console.log(data);
    if (isUpdate && maladie?.id) {
      updateMaladieMutation.mutate({
        maladie: {
          ...data,
          maxB: parseFloat(data.maxB),
          minA: parseFloat(data.minA),
        },
        maladieId: maladie.id,
      });
    }
    if (!isUpdate) {
      addMaladieMutation.mutate({
        maladie: {
          ...data,
          maxB: parseFloat(data.maxB),
          minA: parseFloat(data.minA),
        },
      });
    }
  };
  const queryClient = useQueryClient();
  const updateMaladieMutation = useMutation({
    mutationKey: ["updateMaladie"],
    mutationFn: updateMaladie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-maladies"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["maladie"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("updateMaladie failed,", err);
    },
  });
  const addMaladieMutation = useMutation({
    mutationKey: ["addMaladie"],
    mutationFn: addMaladie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-maladies"] });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("addMaladie failed,", err);
    },
  });
  useEffect(() => {
    console.info(maladie);
    if (isUpdate) {
      form.reset({
        ...maladie,
        minA: maladie?.minA?.toString?.() ?? "",
        maxB: maladie?.maxB?.toString?.() ?? "",
      });
    } else {
      form.reset({
        name: "",
        unit: "",
        maxB: "",
        minA: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Modifier un maladie" : "Créer un maladie"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Mettez à jour les informations du maladie ici. Cliquez sur enregistrer lorsque vous avez terminé."
              : "Remplissez les informations du maladie ici. Cliquez sur enregistrer lorsque vous avez terminé."}
          </DialogDescription>
          <View className="space-y-4 flex">
            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">Nom</Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                  {form.formState.errors.name && (
                    <Text className="text-red-500">
                      {form.formState.errors.name.message}
                    </Text>
                  )}
                </View>
              )}
              name="name"
            />

            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">
                    INR min
                  </Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={field.onChange}
                  />
                  {form.formState.errors.minA && (
                    <Text className="text-red-500">
                      {form.formState.errors.minA.message}
                    </Text>
                  )}
                </View>
              )}
              name="minA"
            />

            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">
                    INR Max
                  </Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value.toString()}
                    keyboardType="numeric"
                    onChangeText={field.onChange}
                  />
                  {form.formState.errors.maxB && (
                    <Text className="text-red-500">
                      {form.formState.errors.maxB.message}
                    </Text>
                  )}
                </View>
              )}
              name="maxB"
            />
          </View>
        </DialogHeader>
        <DialogFooter>
          <Button
            // disabled={!form.formState.isValid}
            onPress={form.handleSubmit(onSubmit)}
          >
            <Text className="font-outfitSemibold">Enregistrer</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteMaladieButton = ({
  maladie,
}: {
  maladie: typeof maladiesTable.$inferSelect;
}) => {
  const onSubmit = () => {
    addMaladieMutation.mutate({ maladieId: maladie.id });
  };
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const addMaladieMutation = useMutation({
    mutationKey: ["deleteMaladie"],
    mutationFn: deleteMaladie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-maladies"] });
      setOpen(false);
    },
    onError: (err) => {
      console.error("deleteMaladie failed.", err);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Trash size={16} color={"red"} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            Supprimer le maladie
          </DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer le maladie {maladie.name} ? Êtes-vous
            sûr(e) ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onPress={onSubmit} variant={"destructive"}>
            <Text className="font-outfitSemibold">Supprimer</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const MaladiesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openData, setOpenData] = useState<{
    open: boolean;
    isUpdate: boolean;
    maladie?: typeof maladiesTable.$inferSelect;
  }>({ open: false, isUpdate: false, maladie: undefined });
  const { data: maladies } = useQuery({
    queryKey: ["all-maladies"],
    queryFn: getAllMaladies,
  });

  const filteredMaladies =
    searchQuery.length <= 1
      ? maladies
      : maladies?.filter((maladie) =>
          maladie.name.toString().includes(searchQuery.toLowerCase())
        );

  return (
    <>
      <View className="flex-1 bg-slate-50">
        <ActionMaladieButton
          {...openData}
          setOpen={(v) => setOpenData((prev) => ({ ...prev, open: v }))}
        />
        <View className="bg-white px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-outfitBold text-gray-900">
                Maladies
              </Text>
              <Text className="text-sm text-muted-foreground font-outfitRegular">
                {filteredMaladies?.length ?? 0} maladies trouvés
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setOpenData({
                  open: true,
                  isUpdate: false,
                  maladie: undefined,
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
                className="flex-1 font-outfitRegular ml-3 text-base text-gray-900"
                placeholder="Rechercher un maladie..."
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

        {/* Maladies List */}
        <ScrollView
          className=""
          bounces={false}
          contentContainerClassName="flex flex-col justify-center mt-2"
          showsHorizontalScrollIndicator={false}
        >
          {filteredMaladies?.map((p) => (
            <MaladieCard
              setOpenData={setOpenData}
              key={p.id + "maladieId-card"}
              malady={p}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
};
const MaladieCard = ({
  malady,
  setOpenData,
}: {
  malady: typeof maladiesTable.$inferSelect;
  setOpenData: (v: {
    maladie?: typeof maladiesTable.$inferSelect;
    open: boolean;
    isUpdate: boolean;
  }) => void;
}) => {
  return (
    <View
      className="mx-2 mb-4 rounded-xl bg-white border flex-1 border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Header with actions */}
      <View className="flex-row relative flex items-start p-4 pb-2">
        <View className="flex-row flex items-center gap-x-3">
          <View className="bg-red-50 p-2 rounded-lg">
            <Thermometer size={20} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-outfitBold text-gray-900 mb-1">
              {malady.name}
            </Text>
            <Text className="text-xs text-muted-foreground font-outfitRegular ">
              Disease Information
            </Text>
          </View>
        </View>

        <View className="flex-col absolute right-0 top-0 flex items-center gap-x-1">
          <Button
            variant="ghost"
            className="p-2"
            onPress={() => {
              setOpenData({
                open: false,
                isUpdate: true,
                maladie: malady,
              });
              setOpenData({
                open: true,
                isUpdate: true,
                maladie: malady,
              });
            }}
          >
            <Pen size={16} color="#6b7280" />
          </Button>
          <DeleteMaladieButton maladie={malady} />
        </View>
      </View>

      {/* INR Values Section */}
      <View className="px-4 pb-4">
        <View className="bg-gray-50 rounded-lg p-3">
          <Text className="text-sm font-outfitSemibold text-gray-700 mb-3 text-center">
            INR Range
          </Text>

          <View className="flex-row justify-between items-center">
            {/* Min Value */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-2">
                <ArrowBigDownDash size={16} color="#10b981" />
                <Text className="text-xs text-muted-foreground font-outfitRegular  ml-1">
                  Minimum
                </Text>
              </View>
              <Text className="text-lg font-outfitBold text-gray-900">
                {malady.minA}
              </Text>
              <Text className="text-xs text-muted-foreground font-outfitRegular ">
                {malady.unit}
              </Text>
            </View>

            {/* Separator */}
            <View className="w-px h-12 bg-gray-200 mx-4" />

            {/* Max Value */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-2">
                <ArrowBigUpDash size={16} color="#f59e0b" />
                <Text className="text-xs text-muted-foreground font-outfitRegular  ml-1">
                  Maximum
                </Text>
              </View>
              <Text className="text-lg font-outfitBold text-gray-900">
                {malady.maxB}
              </Text>
              <Text className="text-xs text-muted-foreground font-outfitRegular ">
                {malady.unit}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer with date */}
      <View className="border-t border-gray-100 px-4 py-3">
        <Text className="text-xs text-gray-400 text-center  font-outfitRegular">
          Created on{" "}
          {new Date(malady.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
};
export default MaladiesScreen;

// export function DiseaseScanRecord({}: {
//   record: typeof patientsInrRecordsTable.$inferSelect;
// }) {
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };
//
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "critical":
//         return "bg-destructive text-destructive-foreground";
//       case "elevated":
//         return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
//       default:
//         return "bg-primary/10 text-primary";
//     }
//   };
//
//   return (
//     <Card className="w-full max-w-sm border border-border shadow-sm">
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Activity className="h-4 w-4 text-primary" />
//             <h3 className="font-semibold text-sm text-card-foreground">
//               {testName}
//             </h3>
//           </div>
//           <Badge variant="secondary" className={getStatusColor(status)}>
//             {status}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="pt-0">
//         <div className="space-y-2">
//           <div className="flex items-baseline gap-1">
//             <span className="text-2xl font-bold text-card-foreground">
//               {value}
//             </span>
//             <span className="text-sm text-muted-foreground">{unit}</span>
//           </div>
//
//           {referenceRange && (
//             <p className="text-xs text-muted-foreground">
//               Reference: {referenceRange}
//             </p>
//           )}
//
//           <div className="pt-2 border-t border-border">
//             <p className="text-xs text-muted-foreground">
//               Recorded: {formatDate(recorded_at)}
//             </p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
