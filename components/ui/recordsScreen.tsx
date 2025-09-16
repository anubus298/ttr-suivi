import { Tabs, TabsContent } from "@/components/ui/tabs";
import { patientsInrRecordsTable } from "@/db/schema";
import { getMaladiById } from "@/lib/api/maladies.api";
import { getPatientById } from "@/lib/api/patients.api";
import {
  addRecord,
  deleteRecord,
  getAllRecordsByUserAMaladieID,
  updateRecord,
} from "@/lib/api/records.api";
import { primaryColor } from "@/lib/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChartBar, Plus, TableOfContents, Trash } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
import { ChartRecords } from "./chart-records";
import { Input } from "./input";
import { Text } from "./text";
const PatientSchema = z.object({
  value: z.string({ message: "Valuer est requis" }),
  recorded_at: z.string(),
});
interface Props {
  userId: number;
  maladieId: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: primaryColor,
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  headerCell: {
    paddingVertical: 0,
  },
  idColumn: {
    flex: 1,
    alignItems: "center",
  },
  valueColumn: {
    flex: 2,
  },
  dateColumn: {
    flex: 3,
    alignItems: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  idText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
export const RecordsScreen = (props: Props) => {
  const [currentTab, setCurrentTab] = useState<"chart" | "table">("table");
  const [openData, setOpenData] = useState<{
    open: boolean;
    isUpdate: boolean;
    record?: typeof patientsInrRecordsTable.$inferSelect;
  }>({ open: false, isUpdate: false, record: undefined });

  const { data: records } = useQuery({
    queryKey: ["records", props.userId, props.maladieId],
    queryFn: async () =>
      await getAllRecordsByUserAMaladieID(props.userId, props.maladieId),
    enabled: !!props.maladieId && !!props.userId,
  });

  const { data: maladie } = useQuery({
    queryKey: ["maladie", props.maladieId],
    queryFn: async () => await getMaladiById(props.maladieId),
    enabled: !!props.maladieId,
  });

  const { data: user } = useQuery({
    queryKey: ["user", props.userId],
    queryFn: async () => await getPatientById(props.userId),
    enabled: !!props.userId,
  });
  return (
    <ScrollView className="flex-1 my-2">
      <>
        <View className="flex-1 bg-slate-50">
          {/* Header */}

          <ActionButton
            unit={maladie?.[0].unit ?? ""}
            userId={props.userId}
            maladieId={props.maladieId}
            {...openData}
            setOpen={(v) => setOpenData((prev) => ({ ...prev, open: v }))}
          />
          <View className="bg-white px-6 pt-14 pb-6">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-2xl font-outfitBold text-gray-900">
                  {user?.[0].full_name}
                </Text>
                <Text className="text-sm text-muted-foreground font-outfitRegular text-wrap">
                  {records?.length ?? 0} records trouvés
                </Text>

                <Text className="text-sm max-w-[40vw] text-muted-foreground font-outfitRegular text-wrap">
                  {maladie?.[0].name}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-x-1">
                <TouchableOpacity
                  onPress={() =>
                    setOpenData({
                      open: true,
                      isUpdate: false,
                      record: undefined,
                    })
                  }
                  className="w-12 h-12 bg-primary rounded-full items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (currentTab === "chart") {
                      setCurrentTab("table");
                    } else {
                      setCurrentTab("chart");
                    }
                  }}
                  className="w-12 h-12 bg-primary rounded-full items-center justify-center"
                  activeOpacity={0.8}
                >
                  {currentTab === "chart" && (
                    <TableOfContents size={24} color={"white"} />
                  )}
                  {currentTab === "table" && (
                    <ChartBar size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
          </View>

          {/* Table Body */}
          <Tabs
            value={currentTab}
            //@ts-expect-error
            onValueChange={setCurrentTab}
            className=""
          >
            <TabsContent value="table">
              <View style={styles.headerRow}>
                <View style={[styles.cell, styles.headerCell, styles.idColumn]}>
                  <Text
                    className="font-outfitSemibold"
                    style={styles.headerText}
                  >
                    ID
                  </Text>
                </View>
                <View
                  style={[styles.cell, styles.headerCell, styles.valueColumn]}
                >
                  <Text
                    className="font-outfitSemibold"
                    style={styles.headerText}
                  >
                    Valuer
                  </Text>
                </View>
                <View
                  style={[styles.cell, styles.headerCell, styles.dateColumn]}
                >
                  <Text
                    className="font-outfitSemibold"
                    style={styles.headerText}
                  >
                    Date de capture
                  </Text>
                </View>

                <View
                  style={[styles.cell, styles.headerCell, styles.dateColumn]}
                >
                  <Text
                    className="font-outfitSemibold"
                    style={styles.headerText}
                  >
                    Actions
                  </Text>
                </View>
              </View>
              {records?.map((r, index) => (
                <View
                  key={r.id}
                  style={[
                    styles.row,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <View style={[styles.cell, styles.idColumn]}>
                    <Text
                      className="text-xs font-outfitRegular"
                      style={styles.idText}
                    >
                      {r.id}
                    </Text>
                  </View>

                  <View style={[styles.cell, styles.valueColumn]}>
                    <Text className="text-sm font-outfitRegular text-center text-green-700">
                      {r.value} {maladie?.[0].unit}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.dateColumn]}>
                    <Text
                      className="text-xs font-outfitRegular text-center"
                      style={styles.dateText}
                    >
                      {formatDate(r.recorded_at)}
                    </Text>
                  </View>

                  <View
                    className="flex items-center justify-center"
                    style={[styles.cell, styles.valueColumn]}
                  >
                    <DeleteButton
                      userId={props.userId}
                      maladieId={props.maladieId}
                      record={r}
                    />
                    {/* <Trash size={16} /> */}
                  </View>
                </View>
              ))}
            </TabsContent>

            <TabsContent value="chart" className="">
              <ChartRecords
                maxB={maladie?.[0].maxB ?? 0}
                minA={maladie?.[0].minA ?? 0}
                unit={maladie?.[0].unit ?? ""}
                records={records ?? []}
              />
            </TabsContent>
          </Tabs>
        </View>
      </>
    </ScrollView>
  );
};

const DeleteButton = ({
  record,
  userId,
  maladieId,
}: {
  record: typeof patientsInrRecordsTable.$inferSelect;
  userId: number;
  maladieId: number;
}) => {
  const onSubmit = () => {
    addPatientMutation.mutate({ recordId: record.id });
  };
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const addPatientMutation = useMutation({
    mutationKey: ["deleteRecord"],
    mutationFn: deleteRecord,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["records", userId, maladieId],
      });
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
          <DialogTitle className="text-red-500">Supprimer</DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer le record {record.id} ? Êtes-vous
            sûr(e) ?
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

const ActionButton = ({
  record,
  isUpdate = false,
  open,
  setOpen,
  userId,
  maladieId,
  unit,
}: {
  record?: typeof patientsInrRecordsTable.$inferSelect;
  isUpdate?: boolean;
  open: boolean;
  unit: string;
  userId: number;
  maladieId: number;
  setOpen: (v: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof PatientSchema>>({
    resolver: zodResolver(PatientSchema),
    //@ts-expect-error
    defaultValues: isUpdate
      ? {
          recorded_at: record?.recorded_at,
          value: record?.value.toString(),
        }
      : {
          recorded_at: new Date().toISOString(),
          value: 0,
        },
  });
  const onSubmit = (data: z.infer<typeof PatientSchema>) => {
    console.log(data);
    if (isUpdate && record?.id) {
      updateRecordMutation.mutate({
        record: {
          ...data,
          value: parseFloat(data.value),
          maladieId: maladieId,
          patientId: userId,
        },
        recordId: record.id,
      });
    }
    if (!isUpdate) {
      addRecordMutation.mutate({
        record: {
          ...data,
          value: parseFloat(data.value),
          maladieId: maladieId,
          patientId: userId,
        },
      });
    }
  };
  const queryClient = useQueryClient();
  const updateRecordMutation = useMutation({
    mutationKey: ["updateRecord"],
    mutationFn: updateRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-records"] });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("addPatient failed,", err);
    },
  });
  const addRecordMutation = useMutation({
    mutationKey: ["addRecord"],
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["records", userId, maladieId],
      });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error("addPatient failed,", err);
    },
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  useEffect(() => {
    if (isUpdate) {
      setDatePickerVisibility(false);
      form.reset({ ...record, value: record?.value.toString() ?? "" });
    } else {
      setDatePickerVisibility(false);
      form.reset({
        value: "0",
        recorded_at: new Date().toISOString(),
      });
    }
  }, [open]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdate
              ? "Modifier un unregistrement"
              : "Créer un unregistrement"}
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
                    Valeur
                  </Text>
                  <Input
                    placeholder="Write some stuff..."
                    value={field.value.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={field.onChange}
                  />
                  {form.formState.errors.value && (
                    <Text className="text-red-500">
                      {form.formState.errors.value.message}
                    </Text>
                  )}
                </View>
              )}
              name="value"
            />

            <Controller
              control={form.control}
              render={({ field }) => (
                <View className="my-2">
                  <Text className="mb-2 text-lg font-outfitSemibold">Date</Text>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    onConfirm={(date) => field.onChange(date.toISOString())}
                    onCancel={hideDatePicker}
                  />
                  <Input
                    placeholder="Write some stuff..."
                    value={formatDate(field.value)}
                    keyboardType="decimal-pad"
                  />
                  <Button
                    onPress={showDatePicker}
                    size={"sm"}
                    variant={"link"}
                    className="p-2"
                  >
                    <Text className="font-outfitSemibold">Choisir la date</Text>
                  </Button>
                </View>
              )}
              name="recorded_at"
            />
          </View>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={!form.formState.isValid}
            //@ts-expect-error
            onPress={form.handleSubmit(onSubmit)}
          >
            <Text className="font-outfitSemibold">Enregistrer</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
