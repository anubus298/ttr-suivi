import React, { useState } from "react";
import { patientsTable } from "@/db/schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  Search,
  Filter,
  Plus,
  User,
  Building2,
  Thermometer,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "@/lib/api/patients.api";
import { Button } from "./button";

const PatientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
  });

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.maladieId.toString().includes(searchQuery.toLowerCase()) ||
      patient.hospital_id?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="bg-white px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Patients</Text>
              <Text className="text-sm text-gray-500">
                {filteredPatients?.length ?? 0} patients trouvés
              </Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex-row items-center">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Rechercher un patient..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Patients List */}
        <ScrollView
          className="space-y-4"
          bounces={false}
          showsHorizontalScrollIndicator={false}
        >
          {patients?.map((p) => (
            <PatientCard key={p.hospital_id + "patient-card"} patient={p} />
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const PatientCard = ({
  patient,
}: {
  patient: typeof patientsTable.$inferSelect;
}) => {
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
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {patient.full_name}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-gray-600">
                ID: {patient.id}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Patient Details */}
      <View className="space-y-3">
        {/* Hospital */}
        <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-2xl">
          <View className="w-8 h-8 bg-blue-200 rounded-full items-center justify-center mr-3">
            <Building2 size={16} color="#2563EB" />
          </View>
          <View>
            <Text className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Hôpital ID
            </Text>
            <Text className="text-base font-semibold text-blue-900">
              {patient.hospital_id}
            </Text>
          </View>
        </View>

        {/* Disease */}
        <View className="flex-row items-center bg-red-50 px-4 py-3 rounded-2xl">
          <View className="w-8 h-8 bg-red-200 rounded-full items-center justify-center mr-3">
            <Thermometer size={16} />
          </View>
          <View>
            <Text className="text-xs font-medium text-red-600 uppercase tracking-wide">
              Diagnostic
            </Text>
            <Text className="text-base font-semibold text-red-900">
              {patient.maladieId}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Indicator */}
      <View className="mt-4 pt-4 border-t border-gray-100">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Text>Touchez pour voir plus de détails</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>
                  <Text>OK</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </View>
  );
};
export default PatientsScreen;
